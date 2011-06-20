# Počítadlo taroků

Verze: 0.2

## Použité technologie

CoffeeScript <http://jashkenas.github.com/coffee-script/>
Coffeekup <http://coffeekup.org/>
Stylus <http://learnboost.github.com/stylus/>
HTML5 Boilerplate <http://html5boilerplate.com/>
Backbone.js <http://documentcloud.github.com/backbone/>
Backbone-localstorage.js <http://documentcloud.github.com/backbone/docs/backbone-localstorage.html>
jQuery <http://jquery.org>

CoffeeScript a Stylus jsou postaveny na Node.js <http://nodejs.org>

Pro testování:

Nginx <http://nginx.net>
Qunit <http://docs.jquery.com/Qunit>


## Instalace

Nejpodstatnější je nainstalovat node.js, na Windows je nutné použít
Cygwin nebo nějakou obdobu. Poté nainstalovat node package manager
<http://npmjs.org> a pomocí toho nainstalovat coffee-script, coffeekup i
stylus. Pro vývoj je třeba nainstalovat ještě i nginx.

## Build

Součástí coffee-scriptu je nástroj 'cake', obdoba C nástroje 'make'.
Pro sestavení projektu stačí spustit 'cake build'. Výstup je v adresáři
target/htdocs.

## Continuální kompilace

Při vývoji je možné v terminálu spustit 'cake watch'. Tento příkaz
spustí automatickou rekompilaci coffee skriptů, stylus zdrojů i
coffeekup templatů, a to i pro testy. Následně spustí i nginx, takže na
lokálním stroji pak je možné přistoupit k aplikaci na adrese
<http://localhost:8080> a k testům na adrese
<http://localhost:8080/tests>.

