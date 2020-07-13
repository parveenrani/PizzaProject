from django.contrib import admin
from .models import *

admin.site.register(CategoryMaster)
admin.site.register(ItemMaster)
admin.site.register(OrderItem)
admin.site.register(Order)
admin.site.register(Topping)
