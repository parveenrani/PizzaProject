    $(document).ready(function (){
        console.log("parveensel");
        var cate;
        var catename;
        var topp;
        var cartitemprice;
        var menu_small_large="";
        var $menu = $('#menu');
        var $cart = $('#cart');
        var $item = $('#item-id');
        var $actualitemprice;

        $("#mycheckout").on('click',function(){
            var rowCount = $('#cart tr').length;
            if (rowCount==0)
            {
                return false;
            }
            else
            {
                return true;
            }
        })
        $('.complete').on('click',function(){
                var orderno=this.id;
                var order_no = $(this).attr('data-orderno');
                $.ajax({
                url: '/order/MarkCompleted/',
                data: {
                    'order_no': order_no,
                },
                dataType: 'json',
                success: function (data) {
                    if(data) {
                     $("#complete-" + order_no).attr('disabled', true);
                        $("#orderstatus-" + order_no).html("This order has been completed.")
                    }
                },
                error: function(){
                    alert('error');
                }
                });
           });
     $('.category').on('click',function(){
                cate=this.id;
                catename = $(this).attr('data-name');
                getitems(this.id);
           });

    $menu.delegate('.add','click',function(){
        var id=$(this);
        var id1 = id.attr('data-id');
        cartitemprice = id.attr('data-price');
        var size = id.attr('data-size');
        topp = id.attr('data-toppings');
        var category = id.attr('data-category');
        $item.val(id1);
        $('#actual-item-price').val(cartitemprice);
        $actualitemprice=$('#actual-item-price').val();

        var itemid = $item.val();
        var opts="";
        var finalselect="";
        var carttotal=0;
        if (topp>0)
        {
            $.ajax({
                url: '/order/topping',
                data: {
                    'id': category,
                },
                dataType: 'json',
                success: function (data) {
                     $.each(data, function(i,toppings){
                       $.each(toppings, function(j,topping){
                            opts=opts+'<option value='+ topping.toppingname +'>' + topping.toppingname + '</option>';
                       });
                     });
                     if (size=='S')
                     {
                        finalselect="Size:<select id='size'><option value='S'>Small</option><option value='L'>Large</option></select><br/>";
                     }
                     else
                     {
                       finalselect="Size:<select id='size'><option value='L'>Large</option><option value='S'>Small</option></select><br/>";
                     }
                     for( var i = 0; i<topp; i++){
                          var select = "<br/>Topping:<select id='topping"+ (i+1) +"'>"+opts+"</select><br/>";
                          finalselect+=select;
                     }
                     $('#modal-body').html(finalselect);
                // show modal
                    $('#modal').modal('show');
                },
                error: function(){
                    alert('error loading toppings');
                }
            });
        }
        else
        {
                $("#cart tr").remove();
                finaltopp="";
                $.ajax({
                    url: '/order/add/',
                    data: {
                        'id': itemid,
                        'size':size,
                        'toppings':finaltopp
                    },
                    dataType: 'json',
                    success: function (data) {
                        $('#carttotal').val('Total:$'+ data.carttotal);
                        $.each(data, function(i,orderitems){
                            $.each(orderitems, function(j,orderitem){
                                   $cart.append('<tr id="cartitem-'+ orderitem.id +'"><td><strong>'+ orderitem.qty + '  ' + orderitem.size + '  ' + orderitem.orderitem  + orderitem.topping   + '</strong></td><td><strong>'+
                                       orderitem.price  + '</strong><button class="remove" data-id='+ orderitem.id +' onclick="deleteCartItem('+ orderitem.id +',\''+ orderitem.size +'\')"><strong>-</strong></button></td></tr>');
                             });
                        });

                    },
                    error: function(){
                        alert('error loading menu');
                    }
                 });
        }
    });


       $("#addtopping").submit(function() {
            $("#cart tr").remove();
            var $item = $('#item-id');
            var itemid = $item.val();
            var itemsize = $('#size').val();
            var finaltopp="";
            var topp1 =  $('#topping1').val();
            var topp2 =  $('#topping2').val();
            var topp3 =  $('#topping3').val();
            if (topp1== undefined)
            { finaltopp="";
            }
            else if (topp2== undefined)
            { finaltopp=topp1;
            }
            else if (topp3== undefined)
            { finaltopp=topp1+"," +topp2;
            }
            else
            {  finaltopp = topp1+"," +topp2+","+topp3;
            }

        // Create Ajax Call
            $.ajax({
                url: '/order/add/',
                data: {
                    'id': itemid,
                    'size':itemsize,
                    'toppings':finaltopp
                },
                dataType: 'json',
                beforeSend: function () {
                    $("#modal").modal("show");
                },
                success: function (data) {
                    $('#carttotal').val('Total:$'+data.carttotal);

                    $.each(data, function(i,orderitems){
                         $.each(orderitems, function(j,orderitem){
                         $cart.append('<tr id="cartitem-'+ orderitem.id +'"><td><strong>'+ orderitem.qty + '  ' + orderitem.size + '  ' + orderitem.orderitem + orderitem.topping + '</strong></td><td><strong>'+
                                       orderitem.price  + '</strong><button class="remove" data-id='+ orderitem.id +' onclick="deleteCartItem('+ orderitem.id +',\''+ orderitem.size +'\')"><strong>-</strong></button></td></tr>');

                         });
                    });
                },
               error: function(){
                    alert('error');
               }
        });

    $('form#addtoppimg').trigger("reset");
    $('#modal').modal('hide');
    return false;
});


});

        function deleteCartItem(id,size) {
            var action=confirm("Are you sure you want to delete this item?");
            var $cart = $('#cart');
            if (action != false) {
                $.ajax({
                    url: '/order/remove/',
                    data: {
                        'cart_item_id':id,
                        'cart_item_size':size,
                    },
                    dataType: 'json',
                    success: function (data) {
                         $("#cart #cartitem-" + id).remove();
                         $('#carttotal').val('Total:$'+data.carttotal);
                         if (!data.deleted) {
                         $cart.append('<tr id="cartitem-'+ data.orderitem[0].id +'"><td><strong>'+
                                    data.orderitem[0].qty + '  ' + data.orderitem[0].size + '  '+data.orderitem[0].orderitem +' '+ data.orderitem[0].topping  + '</strong></td><td><strong>'+
                                      data.orderitem[0].price  + '</strong><button class="remove" data-id='+ data.orderitem[0].id +
                                    ' onclick="deleteCartItem('+ data.orderitem[0].id+',\''+ data.orderitem[0].size  +'\')"><strong>-</strong></button></td></tr>');
                          }
                    },
                    error: function(){
                         alert('No cart item is removed try again');
                    }
                });
            }
        }

        function getitems(id) {
            var Category=id;
            var itemmenu;
            var $menu = $('#menu');
            $("#menu tr").remove();
            $.ajax({
                url: "/order/menu/",
                data: {
                    'id': id,
                },
                dataType: 'json',
                success: function (data) {
                    $.each(data, function(i,items){
                        $.each(items, function(j,item){
                            itemmenu=itemmenu +'<tr><td><strong>'+ item.item_name + '</strong></td>';
                            if (item.price_small=='0.00' || item.price_large=='0.00')
                            {
                                menu_small_large="no small";
                                var $price="";
                                var $size="";
                                if (item.price_small=='0.00')
                                {
                                    $price = item.price_large;
                                }
                                else
                                {
                                    $price = item.price_small;
                                }
                                itemmenu=itemmenu+'<td colspan=2><strong>'+
                                $price + '</strong><button class="add" data-size="" data-id='+item.id +' data-price='+ $price +' data-name='+
                                item.item_name + ' data-toppings=' + item.no_of_topping + ' data-category='+ item.category + '>+</button></td></tr>';
                            }
                            else
                            {
                                menu_small_large="small";
                               itemmenu=itemmenu+'<td><strong>'+ item.price_small + '</strong><button class="add" data-size="S" data-id='+item.id +' data-price='+item.price_small+
                               ' data-name='+ item.item_name + ' data-toppings=' + item.no_of_topping + ' data-category='+ item.category + '>+</button></td><td><strong>'+
                                item.price_large + '</strong><button class="add" data-size="L" data-id='+item.id +' data-price='+item.price_large+' data-name='+ item.item_name +
                                ' data-toppings=' + item.no_of_topping + ' data-category='+ item.category + '>+</button></td></tr>';
                            }
                        });
                    });
                    if (menu_small_large=="no small")
                    {
                          $menu.append('<tr><td><strong>Name</strong></td><td colspan=2><strong>Price</strong></td></tr>');
                    }
                    else
                    {
                          $menu.append('<tr><td><strong>Name</strong></td><td><strong>Small</strong></td><td><strong>Large</strong></td></tr>');
                    }
                    $menu.append(itemmenu);
                },
                error: function(){
                    alert('error loading menu');
                }
            });
         }



         // for register form
         function validregisterform() {
        var a = document.forms["my-form"]["firstname"].value;
        var b = document.forms["my-form"]["lastname"].value;
        var c = document.forms["my-form"]["email"].value;
        var d = document.forms["my-form"]["username"].value;
        var e = document.forms["my-form"]["password1"].value;
        var f = document.forms["my-form"]["password2"].value;

        if (a==null || a=="")
        {
            alert("Please Enter Your First Name");
            return false;
        }else if (b==null || b=="")
        {
            alert("Please Enter Your Last Name");
            return false;
        }else if (c==null || c=="")
        {
            alert("Please Enter Your Email Address");
            return false;
        }else if (d==null || d=="")
        {
            alert("Please Enter Your Username");
            return false;
        }else if (e==null || e=="")
        {
            alert("Please Enter Your Password");
            return false;
        }else if (f==null || f=="")
        {
            alert("Please Enter Your Confirm Password");
            return false;
        }else if (e!=f)
        {
            alert("Password does not match with Confirm Password");
            return false;
        }
    }


