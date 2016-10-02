CORE.create_module("search-box", function(sb) {
    var input, button, reset;

    return {
        init : function () {
            sb.template();

            input = sb.find("#search_input")[0],
            button = sb.find("#search_button")[0],
            reset  = sb.find("#quit_search")[0];
            
            sb.addEvent(button, "click", this.handleSearch);
            sb.addEvent(reset, "click", this.quitSearch);

        },
        destroy : function () {
            sb.removeEvent(button, "click", this.handleSearch);
            sb.removeEvent(button, "click", this.quitSearch);
            input = button = reset = null;
        },
        handleSearch : function () {
            var query = input.value;
            if (query) {
                sb.notify({
                    type : 'perform-search',
                    data : query
                });
            }
        },
        quitSearch : function () {
            input.value = "";
            sb.notify({
                type : 'quit-search',
                data : null
            });
        }
    };
});

CORE.create_module("filters-bar", function (sb) {
    var filters;
    var data;

    return {
        init : function () {
            data = [{text: "Red", href:"#red"}, {text: "Blue", href:"#blue"}, {text: "Mobile", href:"#mobile"}, {text: "Accessory", href:"#accessory"}];
            sb.template(data);

            sb.onEvent("a", "click", this.filterProducts);

            sb.listen({
                'perform-search' : this.addFilterItemToBar
            });
        }, 
        destroy : function () {
            sb.offEvent("a", "click", this.filterProducts);
            filter = null;
        },
        filterProducts : function (e) {
            sb.notify({
                type : 'change-filter',
                data : e.currentTarget.innerHTML
            });
        }
    };
});

CORE.create_module("product-panel", function (sb) {
    var products;

    function eachProduct(fn) {
        var i = 0, product;
        for ( ; product = products[i++]; ) {
            fn(product);
        }
    }
    function reset () {
        eachProduct(function (product) {
            product.style.opacity = '1';        
        });
    }

    return {
        init : function () {
            sb.template();
            
            products = sb.find("li");
            sb.listen({
                'change-filter' : this.change_filter,
                'reset-filter'  : this.reset,
                'perform-search': this.search,
                'quit-search'   : this.reset
            });

            sb.onEvent("li", "click", this.addToCart);
        },
        destroy : function () {
            sb.offEvent("li", "click", this.addToCart);
            sb.ignore(['change-filter', 'reset-filter', 'perform-search', 'quit-search']);
        },
        reset : reset,
        change_filter : function (filter) {
            reset();
            eachProduct(function (product) {
                if (product.getAttribute("data-8088-keyword").toLowerCase().indexOf(filter.toLowerCase()) < 0) {
                    product.style.opacity = '0.2';
                }
            });
        },
        search : function (query) {
            reset();
            query = query.toLowerCase();
            eachProduct(function (product) {
                if (product.getElementsByTagName('p')[0].innerHTML.toLowerCase().indexOf(query) < 0) {
                    product.style.opacity = '0.2';
                }
            });
        },
        addToCart : function (e) {
            var li = e.currentTarget;
            sb.notify({
                type : 'add-item',
                data : { id : li.id, name : li.getElementsByTagName('p')[0].innerHTML, price : parseInt(li.id, 10) }
            });
        }
    };
});


CORE.create_module("shopping-cart", function (sb) {
    var cart, cartItems;
    
    return {
        init : function () {
            cart = sb.find("ul")[0];
            cartItems = {};

            sb.listen({
                'add-item' : this.addItem        
            });
        },
        destroy : function () {
            cart = cartItems = null;
            sb.ignore(['add-item']);
        },
        addItem : function (product) {
            if(cartItems[product.id]) {
                cartItems[product.id].quantity++;
            }else{
                cartItems[product.id] = {name: product.name, quantity: 1, price: product.price.toFixed(2)};
            }
            sb.template(cartItems);
        }
    };
});


CORE.start_all();
