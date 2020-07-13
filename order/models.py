from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse


class CategoryMaster(models.Model):
    categoryName = models.CharField(max_length=64)

    def get_categories(self):
        return self.categoryName.all()

    def __str__(self):
        return self.categoryName

class ItemMaster(models.Model):
    category= models.ForeignKey(CategoryMaster, on_delete=models.CASCADE,related_name="categoryitems")
    item_name = models.CharField(max_length=64,null=False)
    item_type = models.CharField(max_length=10,null=True, blank=True)
    no_of_topping = models.IntegerField(default=0)
    desc = models.CharField(max_length=150,null=True, blank=True)
    item_pic = models.ImageField(upload_to = 'pics', default = 'pics/no-img.jpg')
    price_small = models.DecimalField(max_digits=5,decimal_places=2)
    price_large = models.DecimalField(max_digits=5,decimal_places=2)

    #def __str__(self):
     #   return '{} {} - {}'.format(self.id,self.item,self.category)


class Topping(models.Model):
    toppingname = models.CharField(max_length=64)
    category = models.ForeignKey(CategoryMaster, on_delete=models.CASCADE)

    def __str__(self):
        return 'Topping {}'.format(self.toppingname)

    def get_category_toppings(self):
        return reverse("categoryitems", kwargs={'category': self.category})



class OrderItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    productitem = models.ForeignKey(ItemMaster, on_delete=models.CASCADE)
    orderitem = models.CharField(max_length=64,null=False)
    qty = models.IntegerField(default=0)
    size = models.CharField(max_length=1)
    price = models.DecimalField(max_digits=5,decimal_places=2,default=0)
    topping = models.CharField(max_length=80,null=True,blank=True)
    orderconfirmed = models.BooleanField(default=False)
    addeddate = models.DateField(auto_now_add=True)
    orderdate = models.DateField(null=True)



class Order(models.Model):
    orderno = models.CharField(max_length=64)
    users = models.ForeignKey(User, on_delete=models.CASCADE)
    items = models.ManyToManyField(OrderItem)
    addeddate = models.DateField(auto_now_add=True)
    orderdate = models.DateField(null=True)
    orderstatus = models.BooleanField(default=False)
    orderconfirmed = models.BooleanField(default=False)

    def get_cart_items(self):
        return self.items.all()

    def get_cart_total(self):
        return sum([item.price for item in self.items.all()])

    def is_completed(self):
        return self.orderstatus

    def mark_as_completed(self):
        self.orderstatus=True
        self.save()

    def __str__(self):
        return f"{self.orderno} - {self.users}"


