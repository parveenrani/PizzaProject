from django.shortcuts import render,redirect,reverse
from django.contrib.auth import authenticate,login,logout
from django.contrib.auth.models import User
from django.http import HttpResponseRedirect


def home(request):
    if request.user.is_authenticated:
        context = {"user": request.user}
        return redirect("category_ajax")
    else:
        return render(request,"login.html",{"msg":None})


def register(request):
    if request.method == 'POST':
        firstname = request.POST["firstname"]
        lastname = request.POST["lastname"]
        email = request.POST["email"]
        username = request.POST["username"]
        password1 = request.POST["password1"]
        password2 = request.POST["password2"]
        if firstname=="" or lastname=="" or email=="" or username=="" or password1=="":
            return render(request, "register.html", {"msg": "Please enter proper data"})
        if password1 == password2:
            if User.objects.filter(username=username).exists():
                return render(request,"register.html", {"msg": "username is already registred"})
            else:
                user = User.objects.create_user(username=username, password=password1, email=email, first_name=firstname,
                                                    last_name=lastname)
                user.save()
                return render(request, "login.html", {"msg": "user registred"})
        else:
            return render(request, "register.html", {"msg": "Password does not match..."})
    else:
        return render(request, 'register.html',{"msg": None})


def login_view(request):
    if request.method == 'POST':
        username = request.POST["username"]
        password = request.POST["password"]

        user = authenticate(request,username=username,password=password)

        if user is not None:
            login(request,user)
            return HttpResponseRedirect(reverse("home"))
        else:
            return render(request,"login.html",{"msg":"Invalid credentils...."})
    else:
        return render(request,"login.html",{"msg": None})


def logout_view(request):
    logout(request)
    return render(request,"login.html",{"msg": "logged out"})