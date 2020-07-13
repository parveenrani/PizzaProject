from django.urls import path
from . import views


urlpatterns = [
    path('',  views.index, name='category_ajax'),
    path('menu/', views.categoryitems, name='categoryitems'),
    path('topping/', views.toppings, name='toppings'),
    path('add/',views.addtoorder, name='addtoorder'),
    path('remove/',views.delete_item, name='delete_item'),
    path("order_summary", views.order_summary, name="order_summary"),
    path("order_detail", views.all_order_details, name="order_detail"),
    path("MarkCompleted/", views.MarkOrderAsComplete, name="MarkOrderAsComplete"),
    path("checkout",views.checkout, name="checkout"),
    path("payment/<int:orderid>", views.proceedtopayment, name="proceedtopayment")
]
