
     $(document).ready(function (){
        console.log("parveennew");
        var cate;
        var catename;
        var topp;
        var cartitemprice;
        var menu_small_large="";
        var $menu = $('#menu');
     $('.category').on('click',function(){
                cate=this.id;
                catename = $(this).attr('data-name');
                getitems(this.id);
                counter=0;
           });
     $('.topp').on('click',function(){
        getToppings(cate);

    });

      });
      function getToppings(category){
            var $menu = $('#menu');
            $("#menu tr").remove();
            $menu.append('<tr><td>Toppings</td></tr>');

            $.ajax({
                url:'/order/topping',
                data: {
                    'id': category,
                },
                dataType: 'json',
                success: function (data) {
                     $.each(data, function(i,toppings){
                       $.each(toppings, function(j,topping){
                            $menu.append('<tr><td><b>'+ topping.toppingname + '</b></td></tr>');
                            });
                            });
                },
                error: function(){
                    alert('error loading toppings');
                }
            });
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
                            itemmenu=itemmenu +'<tr><td><b>'+ item.item_name + '</b></td>';
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
                                itemmenu=itemmenu+'<td colspan=2><b>'+ $price + '</b></td></tr>';
                            }
                            else
                            {
                                menu_small_large="small";
                               itemmenu=itemmenu+'<td><b>'+ item.price_small + '</b></td><td><b>'+
                                item.price_large + '</b></td></tr>';
                            }
                        });
                    });
                    if (menu_small_large=="no small")
                    {
                          $menu.append('<tr><td><strong>Name</strong></td><td colspan=2><strong>Price</strong></td></tr>');
                    }
                    else
                    {
                          $menu.append('<tr><td><b>Name</b></td><td><b>Small</b></td><td><b>Large</b></td></tr>');
                    }
                    $menu.append(itemmenu);
                },
                error: function(){
                    alert('error loading menu');
                }
            });
         }

