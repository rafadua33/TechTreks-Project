from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# create db instance 
db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    
    # Relationship to products
    products = db.relationship('Product', backref='seller', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<User {self.username}>'

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    body = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "sender_id": self.sender_id,
            "recipient_id": self.recipient_id,
            "body": self.body,
            "created_at": self.created_at.isoformat()
        }


class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    condition = db.Column(db.String(20), nullable=False)  # new, like-new, good, fair, poor
    quantity = db.Column(db.Integer, default=1, nullable=False)
    status = db.Column(db.String(20), default='active', nullable=False)  # active, sold, reserved
    is_public = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationship to images
    images = db.relationship('ProductImage', backref='product', lazy=True, cascade='all, delete-orphan')

    def to_dict(self, include_seller=False, include_images=False):
        """Serialize product to dictionary"""
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'price': self.price,
            'category': self.category,
            'condition': self.condition,
            'quantity': self.quantity,
            'status': self.status,
            'is_public': self.is_public,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        
        if include_seller and self.seller:
            data['seller'] = {
                'id': self.seller.id,
                'username': self.seller.username
            }
        
        if include_images:
            data['images'] = [img.to_dict() for img in self.images]
            # Add thumbnail URL (primary image or first image)
            primary_img = next((img for img in self.images if img.is_primary), None)
            if not primary_img and self.images:
                primary_img = self.images[0]
            data['thumbnail_url'] = primary_img.url if primary_img else None
        
        return data

    def __repr__(self):
        return f'<Product {self.title}>'


class ProductImage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    url = db.Column(db.String(500), nullable=False)
    is_primary = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        """Serialize image to dictionary"""
        return {
            'id': self.id,
            'product_id': self.product_id,
            'url': self.url,
            'is_primary': self.is_primary,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f'<ProductImage {self.id} for Product {self.product_id}>'

