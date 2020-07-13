from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import *
import random, datetime


def index(request):
    Category=list(CategoryMaster.objects.values('id','categoryName'))
    if request.user.is_authenticated:
        user = request.user
        existingorders = Order.objects.filter(users=user, orderconfirmed=False)
        if existingorders.exists():
            existingorder = existingorders[0]
        else:
            existingorder=""
        return render(request, 'order_selection.html', {"Category": Category, "order": existingorder})

    return render(request, "mainmenu.html", {"Category": Category})


def categoryitems(request):
    id1 = request.GET.get('id', None)
    items = list(ItemMaster.objects.filter(category=id1).values('category','id', 'item_name', 'price_small', 'price_large', 'no_of_topping', 'item_pic').order_by('id'))
    data = {
       'items': items
    }
    return JsonResponse(data)


def toppings(request):
    category = request.GET.get('id',None)
    toppings_list=list(Topping.objects.filter(category=category).values('id','toppingname'))
    data={'toppings':toppings_list}
    return JsonResponse(data)


def addtoorder(request):
        if not request.user.is_authenticated:
            return redirect('login')
        user = request.user
        itemid = request.GET.get('id', None)
        size = request.GET.get('size', None)
        selectedtoppings = request.GET.get('toppings',None)
        if(selectedtoppings):
            selectedtoppings=selectedtoppings.split(',')
            selectedtoppings.sort()

        item = ItemMaster.objects.filter(pk=itemid).first()
        if size=="S":
            price=item.price_small
        elif size=="L":
            price=item.price_large
        elif size=="":
            if item.price_small==0.00:
                price = item.price_large
            elif item.price_large == 0.00:
                price = item.price_small
        category = item.category.categoryName
        itemname = item.item_name
        orderitemname = category + " " + itemname

        orderitem, status= OrderItem.objects.get_or_create(user=user,productitem=item, size=size, orderitem=orderitemname,topping=selectedtoppings,orderdate=None)
        orderitem.qty += 1
        orderitem.price+=price
        orderitem.save()
        order, status = Order.objects.get_or_create(users=user,orderconfirmed=False)
        order.items.add(orderitem)
        if status:
            order.orderno = str(random.randint(0, 10000)) + datetime.datetime.now().strftime('%Y%m%d')
            order.save()

        allorderitems = list(order.items.values('id','orderitem', 'size', 'price', 'topping','qty'))
        carttotal=order.get_cart_total()

        data = {
            'orderitem': allorderitems,
            'carttotal':carttotal
        }
        return JsonResponse(data)


def delete_item(request):
    if not request.user.is_authenticated:
        return redirect('login')
    cart_item_id = request.GET.get('cart_item_id', None)
    cart_item_size = request.GET.get('cart_item_size',None)

    itemtodelete=OrderItem.objects.filter(pk=cart_item_id)

    if cart_item_size == 'S':
        price = itemtodelete[0].productitem.price_small
    elif cart_item_size == 'L':
        price = itemtodelete[0].productitem.price_large
    elif cart_item_size == "":
        if itemtodelete[0].productitem.price_small == 0.00:
            price = itemtodelete[0].productitem.price_large
        elif itemtodelete[0].productitem.price_large == 0.00:
            price = itemtodelete[0].productitem.price_small

    if itemtodelete[0].qty == 1:
        itemtodelete[0].delete()
        deleted = True
    else:
        newqty=itemtodelete[0].qty - 1
        newprice = itemtodelete[0].price-price
        itemtodelete.update(price=newprice,qty=newqty)
        deleted = False

    orderitem = list(itemtodelete.values('id','orderitem','qty','size','price','topping','productitem'))
    order = Order.objects.get(users=request.user,orderconfirmed=False)
    carttotal = order.get_cart_total()
    data = {
        'deleted': deleted,
        'orderitem':orderitem,
        'carttotal': carttotal
    }
    return JsonResponse(data)


def order_summary(request):
    if not request.user.is_authenticated:
        return redirect('login')
    user=request.user
    existingorders=Order.objects.filter(users=user,orderconfirmed=False)
    if existingorders.exists():
        existingorder = existingorders[0]
    else:
        existingorder = None
    context={"order": existingorder}
    return render(request,"order_summary.html",context)


def checkout(request):
    if not request.user.is_authenticated:
        return redirect('login')
    user=request.user
    existingorders=Order.objects.filter(users=user,orderconfirmed=False)
    if existingorders.exists():
        existingorder=existingorders[0]
        items=existingorder.items.all()
        if items.exists():
            existingorders.update(orderdate=datetime.datetime.now(),orderconfirmed=True)
            OrderItem.objects.filter(user=user,orderdate=None).update(orderdate=datetime.datetime.now(),orderconfirmed=True)
    else:
        existingorder=None
    context={"order": existingorder}
    return render(request,"checkout.html",context)


def MarkOrderAsComplete(request):
    if not request.user.is_authenticated:
        return redirect('login')
    order_no = request.GET.get('order_no', None)
    Order.objects.filter(orderno=order_no)[0].mark_as_completed()
    data = {
        'orderstatus' : True
    }
    return JsonResponse(data)


def all_order_details(request):
    if not request.user.is_authenticated:
        return redirect('login')

    if request.user.is_superuser:
        orders=Order.objects.filter(orderstatus=False,orderconfirmed=True)  #for admin
    else:
        orders = Order.objects.filter(users=request.user,orderconfirmed=True)  #for particular user

    context = {"orders": orders}
    return render(request, "order_detail.html", context)



def proceedtopayment(request,orderid):
    pass



