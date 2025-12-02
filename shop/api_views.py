from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .middleware import api_login_required, admin_required
from .models import Product, Category, Cart, CartItem, SavedItem, Order, OrderItem, UserProfile
import json

@csrf_exempt
@require_http_methods(["POST"])
def api_login(request):
    data = json.loads(request.body)
    username = data.get('username')
    password = data.get('password')
    
    user = authenticate(request, username=username, password=password)
    if user:
        login(request, user)
        return JsonResponse({
            'success': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff
            }
        })
    return JsonResponse({'error': 'Invalid credentials'}, status=401)

@csrf_exempt
@require_http_methods(["POST"])
def api_register(request):
    data = json.loads(request.body)
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if User.objects.filter(username=username).exists():
        return JsonResponse({'error': 'Username already exists'}, status=400)
    
    user = User.objects.create_user(username=username, email=email, password=password)
    UserProfile.objects.create(user=user)
    Cart.objects.create(user=user)
    
    return JsonResponse({'success': True, 'message': 'User created successfully'})

@api_login_required
@require_http_methods(["POST"])
def api_logout(request):
    logout(request)
    return JsonResponse({'success': True})

@require_http_methods(["GET"])
def api_products(request):
    products = Product.objects.all()
    data = [{
        'id': p.id,
        'name': p.name,
        'description': p.description,
        'price': float(p.price),
        'sale_price': float(p.sale_price) if p.sale_price else None,
        'category': p.category.name,
        'sizes': p.sizes,
        'colors': p.colors,
        'images': p.images,
        'in_stock': p.in_stock,
        'is_new': p.is_new,
        'on_sale': p.on_sale,
        'rating': float(p.rating),
        'reviews': p.reviews
    } for p in products]
    return JsonResponse({'products': data})

@api_login_required
@csrf_exempt
def api_cart(request):
    cart, _ = Cart.objects.get_or_create(user=request.user)
    
    if request.method == 'GET':
        items = [{
            'id': item.id,
            'product': {
                'id': item.product.id,
                'name': item.product.name,
                'price': float(item.product.price),
                'images': item.product.images
            },
            'quantity': item.quantity,
            'selected_size': item.selected_size,
            'selected_color': item.selected_color
        } for item in cart.items.all()]
        return JsonResponse({'items': items})
    
    elif request.method == 'POST':
        data = json.loads(request.body)
        product = Product.objects.get(id=data['product_id'])
        
        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            selected_size=data['selected_size'],
            selected_color=data['selected_color'],
            defaults={'quantity': data['quantity']}
        )
        
        if not created:
            item.quantity += data['quantity']
            item.save()
        
        return JsonResponse({'success': True})

@api_login_required
@csrf_exempt
def api_saved(request):
    if request.method == 'GET':
        items = SavedItem.objects.filter(user=request.user)
        data = [{
            'id': item.id,
            'product': {
                'id': item.product.id,
                'name': item.product.name,
                'price': float(item.product.price),
                'images': item.product.images
            }
        } for item in items]
        return JsonResponse({'items': data})
    
    elif request.method == 'POST':
        data = json.loads(request.body)
        product = Product.objects.get(id=data['product_id'])
        SavedItem.objects.get_or_create(user=request.user, product=product)
        return JsonResponse({'success': True})

@admin_required
@require_http_methods(["GET"])
def api_admin_orders(request):
    orders = Order.objects.all().order_by('-created_at')
    data = [{
        'id': order.id,
        'order_id': order.order_id,
        'user': order.user.username,
        'total_amount': float(order.total_amount),
        'status': order.status,
        'created_at': order.created_at.isoformat()
    } for order in orders]
    return JsonResponse({'orders': data})