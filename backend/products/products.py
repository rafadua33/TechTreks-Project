from flask import Blueprint, request, jsonify, session
from models import db, Product, ProductImage, User
from sqlalchemy import or_, and_
import logging

products_bp = Blueprint("products", __name__)
logger = logging.getLogger(__name__)

# Helper: Check if user is authenticated
def get_current_user_id():
    """Return current user ID from session, or None if not authenticated"""
    return session.get("user_id")

def require_auth():
    """Return user_id if authenticated, otherwise return error response"""
    user_id = get_current_user_id()
    if not user_id:
        return None, (jsonify({"error": "authentication required"}), 401)
    return user_id, None


# ============================================================================
# GET /products - List all products with pagination, search, and filters
# ============================================================================
@products_bp.route("", methods=["GET"])
def list_products():
    """
    List products with optional filters:
    - page: page number (default 1)
    - page_size: items per page (default 20, max 100)
    - q: search query (searches title and description)
    - category: filter by category
    - min_price: minimum price
    - max_price: maximum price
    - condition: filter by condition (new, like-new, good, fair, poor)
    - sort: sort field (created_at, price, title) default: created_at
    - order: sort order (asc, desc) default: desc
    - status: filter by status (active, sold, reserved) default: active
    """
    try:
        # Pagination params
        page = request.args.get('page', 1, type=int)
        page_size = min(request.args.get('page_size', 20, type=int), 100)
        
        # Search and filter params
        search_query = request.args.get('q', '').strip()
        category = request.args.get('category', '').strip()
        min_price = request.args.get('min_price', type=float)
        max_price = request.args.get('max_price', type=float)
        condition = request.args.get('condition', '').strip()
        status = request.args.get('status', 'active').strip()
        
        # Sort params
        sort_field = request.args.get('sort', 'created_at').strip()
        sort_order = request.args.get('order', 'desc').strip()
        
        # Build query
        query = Product.query.filter_by(is_public=True)
        
        # Apply filters
        if status:
            query = query.filter_by(status=status)
        
        if category:
            query = query.filter_by(category=category)
        
        if condition:
            query = query.filter_by(condition=condition)
        
        if min_price is not None:
            query = query.filter(Product.price >= min_price)
        
        if max_price is not None:
            query = query.filter(Product.price <= max_price)
        
        # Search in title and description
        if search_query:
            search_pattern = f"%{search_query}%"
            query = query.filter(
                or_(
                    Product.title.ilike(search_pattern),
                    Product.description.ilike(search_pattern)
                )
            )
        
        # Apply sorting
        valid_sort_fields = {'created_at', 'price', 'title', 'updated_at'}
        if sort_field not in valid_sort_fields:
            sort_field = 'created_at'
        
        sort_column = getattr(Product, sort_field)
        if sort_order == 'asc':
            query = query.order_by(sort_column.asc())
        else:
            query = query.order_by(sort_column.desc())
        
        # Execute pagination
        pagination = query.paginate(page=page, per_page=page_size, error_out=False)
        
        # Serialize results - for list view, include seller and thumbnail
        items = [
            product.to_dict(include_seller=True, include_images=True)
            for product in pagination.items
        ]
        
        return jsonify({
            "items": items,
            "page": pagination.page,
            "page_size": pagination.per_page,
            "total": pagination.total,
            "total_pages": pagination.pages,
            "has_next": pagination.has_next,
            "has_prev": pagination.has_prev
        }), 200
        
    except Exception as e:
        logger.error(f"Error listing products: {e}")
        return jsonify({"error": "failed to list products"}), 500


# ============================================================================
# GET /products/<id> - Get single product details
# ============================================================================
@products_bp.route("/<int:product_id>", methods=["GET"])
def get_product(product_id):
    """
    Get detailed information about a specific product
    """
    try:
        product = Product.query.get(product_id)
        
        if not product:
            return jsonify({"error": "product not found"}), 404
        
        # Check if product is public or user owns it
        current_user_id = get_current_user_id()
        if not product.is_public and product.user_id != current_user_id:
            return jsonify({"error": "product not found"}), 404
        
        # Return full details with seller and images
        return jsonify(product.to_dict(include_seller=True, include_images=True)), 200
        
    except Exception as e:
        logger.error(f"Error getting product {product_id}: {e}")
        return jsonify({"error": "failed to get product"}), 500


# ============================================================================
# POST /products - Create new product
# ============================================================================
@products_bp.route("", methods=["POST"])
def create_product():
    """
    Create a new product listing
    Required fields: title, price, category, condition
    Optional fields: description, quantity, is_public
    """
    user_id, error = require_auth()
    if error:
        return error
    
    try:
        data = request.get_json() or {}
        
        # Validate required fields
        title = (data.get('title') or '').strip()
        price = data.get('price')
        category = (data.get('category') or '').strip()
        condition = (data.get('condition') or '').strip()
        
        if not title:
            return jsonify({"error": "title is required"}), 400
        
        if not price or price <= 0:
            return jsonify({"error": "valid price is required"}), 400
        
        if not category:
            return jsonify({"error": "category is required"}), 400
        
        valid_conditions = {'new', 'like-new', 'good', 'fair', 'poor'}
        if condition not in valid_conditions:
            return jsonify({"error": f"condition must be one of: {', '.join(valid_conditions)}"}), 400
        
        # Validate optional fields
        description = (data.get('description') or '').strip()
        quantity = data.get('quantity', 1)
        is_public = data.get('is_public', True)
        
        if quantity < 0:
            return jsonify({"error": "quantity must be non-negative"}), 400
        
        # Create product
        product = Product(
            user_id=user_id,
            title=title,
            description=description,
            price=price,
            category=category,
            condition=condition,
            quantity=quantity,
            is_public=is_public,
            status='active'
        )
        
        db.session.add(product)
        db.session.commit()
        
        logger.info(f"User {user_id} created product {product.id}")
        
        return jsonify({
            "ok": True,
            "msg": "product created",
            "product": product.to_dict(include_seller=True, include_images=True)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating product: {e}")
        return jsonify({"error": "failed to create product"}), 500


# ============================================================================
# PUT /products/<id> - Update product
# ============================================================================
@products_bp.route("/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    """
    Update an existing product
    User must own the product
    """
    user_id, error = require_auth()
    if error:
        return error
    
    try:
        product = Product.query.get(product_id)
        
        if not product:
            return jsonify({"error": "product not found"}), 404
        
        # Check ownership
        if product.user_id != user_id:
            return jsonify({"error": "permission denied"}), 403
        
        data = request.get_json() or {}
        
        # Update fields if provided
        if 'title' in data:
            title = (data['title'] or '').strip()
            if not title:
                return jsonify({"error": "title cannot be empty"}), 400
            product.title = title
        
        if 'description' in data:
            product.description = (data['description'] or '').strip()
        
        if 'price' in data:
            price = data['price']
            if price <= 0:
                return jsonify({"error": "price must be positive"}), 400
            product.price = price
        
        if 'category' in data:
            category = (data['category'] or '').strip()
            if not category:
                return jsonify({"error": "category cannot be empty"}), 400
            product.category = category
        
        if 'condition' in data:
            condition = (data['condition'] or '').strip()
            valid_conditions = {'new', 'like-new', 'good', 'fair', 'poor'}
            if condition not in valid_conditions:
                return jsonify({"error": f"condition must be one of: {', '.join(valid_conditions)}"}), 400
            product.condition = condition
        
        if 'quantity' in data:
            quantity = data['quantity']
            if quantity < 0:
                return jsonify({"error": "quantity must be non-negative"}), 400
            product.quantity = quantity
        
        if 'status' in data:
            status = (data['status'] or '').strip()
            valid_statuses = {'active', 'sold', 'reserved'}
            if status not in valid_statuses:
                return jsonify({"error": f"status must be one of: {', '.join(valid_statuses)}"}), 400
            product.status = status
        
        if 'is_public' in data:
            product.is_public = bool(data['is_public'])
        
        db.session.commit()
        
        logger.info(f"User {user_id} updated product {product_id}")
        
        return jsonify({
            "ok": True,
            "msg": "product updated",
            "product": product.to_dict(include_seller=True, include_images=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating product {product_id}: {e}")
        return jsonify({"error": "failed to update product"}), 500


# ============================================================================
# DELETE /products/<id> - Delete product
# ============================================================================
@products_bp.route("/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    """
    Delete a product
    User must own the product
    """
    user_id, error = require_auth()
    if error:
        return error
    
    try:
        product = Product.query.get(product_id)
        
        if not product:
            return jsonify({"error": "product not found"}), 404
        
        # Check ownership
        if product.user_id != user_id:
            return jsonify({"error": "permission denied"}), 403
        
        db.session.delete(product)
        db.session.commit()
        
        logger.info(f"User {user_id} deleted product {product_id}")
        
        return jsonify({"ok": True, "msg": "product deleted"}), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting product {product_id}: {e}")
        return jsonify({"error": "failed to delete product"}), 500


# ============================================================================
# GET /products/user/<user_id> - Get all products by a specific user
# ============================================================================
@products_bp.route("/user/<int:user_id>", methods=["GET"])
def get_user_products(user_id):
    """
    Get all products listed by a specific user
    """
    try:
        # Check if user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "user not found"}), 404
        
        # Pagination
        page = request.args.get('page', 1, type=int)
        page_size = min(request.args.get('page_size', 20, type=int), 100)
        
        # Build query - only show public products unless viewing own profile
        current_user_id = get_current_user_id()
        query = Product.query.filter_by(user_id=user_id)
        
        if current_user_id != user_id:
            query = query.filter_by(is_public=True, status='active')
        
        query = query.order_by(Product.created_at.desc())
        
        pagination = query.paginate(page=page, per_page=page_size, error_out=False)
        
        items = [
            product.to_dict(include_seller=True, include_images=True)
            for product in pagination.items
        ]
        
        return jsonify({
            "items": items,
            "page": pagination.page,
            "page_size": pagination.per_page,
            "total": pagination.total,
            "total_pages": pagination.pages,
            "has_next": pagination.has_next,
            "has_prev": pagination.has_prev,
            "seller": {
                "id": user.id,
                "username": user.username
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting products for user {user_id}: {e}")
        return jsonify({"error": "failed to get user products"}), 500