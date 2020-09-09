
var test = require('tape');

var SVGElement = window.SVGElement;
var CustomEvent = window.CustomEvent;

var createElement = document.createElement;

document.createElement = function (tagName) {
  var element = createElement.call(document, tagName);

  element.style.webkitTestPrefixes = '';

  return element;
};

module.exports = function (redom) {
  var { el, html, list, listPool, place, router, svg, mount, unmount, setChildren, setAttr, setStyle, setXlink, setData, text } = redom;

  test('exports utils', function (t) {
    t.plan(2);
    t.ok(setAttr != null);
    t.ok(setStyle != null);
  });

  test('element creation', function (t) {
    t.test('without tagName', function (t) {
      t.plan(1);
      var div = el('');
      t.equals(div.outerHTML, '<div></div>');
    });
    t.test('just tagName', function (t) {
      t.plan(1);
      var hello = el('p', 'Hello world!');
      t.equals(hello.outerHTML, '<p>Hello world!</p>');
    });
    t.test('with Component constructor', function (t) {
      t.plan(2);
      var hello = el(function () {
        this.el = el('p');
      }, 'Hello world!');
      t.equals(hello.el.outerHTML, '<p>Hello world!</p>');

      var hello2 = svg(function () {
        this.el = svg('circle');
      }, 'Hello world!');
      t.equals(hello2.el.outerHTML, '<circle>Hello world!</circle>');
    });
    t.test('one class', function (t) {
      t.plan(1);
      var hello = el('p.hello', 'Hello world!');
      t.equals(hello.outerHTML, '<p class="hello">Hello world!</p>');
    });
    t.test('append number', function (t) {
      t.plan(3);
      var one = el('div', 1);
      var minus = el('div', -1);
      var zero = el('div', 0);
      t.equals(one.outerHTML, '<div>1</div>');
      t.equals(minus.outerHTML, '<div>-1</div>');
      t.equals(zero.outerHTML, '<div>0</div>');
    });
    t.test('multiple class', function (t) {
      t.plan(1);
      var hello = el('p.hello.world', 'Hello world!');
      t.equals(hello.outerHTML, '<p class="hello world">Hello world!</p>');
    });
    t.test('multiple class, mixed + setAttr + remove attribute', function (t) {
      t.plan(3);

      var hello = el('p.hello', { class: 'world' }, 'Hello world!');
      t.equals(hello.outerHTML, '<p class="hello world">Hello world!</p>');

      setAttr(hello, { class: 'world' });
      t.equals(hello.outerHTML, '<p class="world">Hello world!</p>');

      setAttr(hello, { class: null });
      t.equals(hello.outerHTML, '<p>Hello world!</p>');
    });
    t.test('append text', function (t) {
      t.plan(1);
      var hello = el('p', 'Hello', ' ', 'world!');
      t.equals(hello.outerHTML, '<p>Hello world!</p>');
    });
    t.test('ID', function (t) {
      t.plan(1);
      var hello = el('p#hello', 'Hello world!');
      t.equals(hello.outerHTML, '<p id="hello">Hello world!</p>');
    });
    t.test('styles with object + remove style', function (t) {
      t.plan(2);

      var hello = el('p', { style: { color: 'red', opacity: 0 } });
      t.equals(hello.outerHTML, '<p style="color: red; opacity: 0;"></p>');

      setStyle(hello, 'opacity', null);
      t.equals(hello.outerHTML, '<p style="color: red;"></p>');
    });
    t.test('styles with String', function (t) {
      t.plan(1);
      var hello = el('p', { style: 'color: red;' });
      t.equals(hello.outerHTML, '<p style="color: red;"></p>');
    });
    t.test('event handlers', function (t) {
      t.plan(1);
      var hello = el('p', { onclick: e => t.pass() }, 'Hello world!');
      hello.click();
    });
    t.test('attributes', function (t) {
      t.plan(1);
      var hello = el('p', { foo: 'bar', zero: 0 }, 'Hello world!');
      t.equals(hello.outerHTML, '<p foo="bar" zero="0">Hello world!</p>');
    });
    t.test('children', function (t) {
      t.plan(1);
      var app = el('app',
        el('h1', 'Hello world!')
      );
      t.equals(app.outerHTML, '<app><h1>Hello world!</h1></app>');
    });
    t.test('child views', function (t) {
      t.plan(1);
      function Test () {
        this.el = el('test');
      }
      var app = el('app',
        new Test()
      );
      t.equals(app.outerHTML, '<app><test></test></app>');
    });
    t.test('child view composition', function (t) {
      t.plan(1);
      function Test () {
        this.el = (new function () {
          this.el = el('test');
        }());
      }
      var app = el('app',
        new Test()
      );
      t.equals(app.outerHTML, '<app><test></test></app>');
    });
    t.test('array', function (t) {
      t.plan(1);
      var ul = el('ul',
        [1, 2, 3].map(function (i) {
          return el('li', i);
        })
      );
      t.equals(ul.outerHTML, '<ul><li>1</li><li>2</li><li>3</li></ul>');
    });
    t.test('dataset + remove', function (t) {
      t.plan(2);

      var p = el('p', { dataset: { a: 'test' } });

      t.equals(p.outerHTML, '<p data-a="test"></p>');

      setData(p, 'a', null);

      t.equals(p.outerHTML, '<p></p>');
    });
    t.test('input list attribute', function (t) {
      t.plan(1);

      var input = el('input', { list: 'asd' });
      t.equals(input.outerHTML, '<input list="asd">');
    });
    t.test('middleware', function (t) {
      t.plan(1);
      var app = el('app',
        function (el) {
          el.setAttribute('ok', '!');
        },
        el('h1', 'Hello world!')
      );
      t.equals(app.outerHTML, '<app ok="!"><h1>Hello world!</h1></app>');
    });
    t.test('extend cached', function (t) {
      t.plan(1);

      var H1 = el.extend('h1');
      var h1 = H1('Hello world!');

      t.equals(h1.outerHTML, '<h1>Hello world!</h1>');
    });
    t.test('extend', function (t) {
      t.plan(1);

      var H2 = el.extend('h2');
      var h2 = H2('Hello world!');

      t.equals(h2.outerHTML, '<h2>Hello world!</h2>');
    });
    t.test('lifecycle events', function (t) {
      t.plan(1);
      var eventsFired = {
        onmount: 0,
        onremount: 0,
        onunmount: 0
      };
      function Item (id) {
        this.el = el('p');
        this.onmount = function () {
          eventsFired.onmount++;
        };
        this.onremount = function () {
          eventsFired.onremount++;
        };
        this.onunmount = function () {
          eventsFired.onunmount++;
        };
      }
      var item = new Item(1);
      var item2 = new Item(2);
      mount(document.body, item); // mount
      mount(document.head, item2); // mount
      mount(document.body, item2); // unmount & mount
      mount(document.body, item.el); // remount, test view lookup (__redom_view)
      unmount(document.body, item); // unmount
      t.deepEqual(eventsFired, {
        onmount: 3,
        onremount: 1,
        onunmount: 2
      });
    });
    t.test('lifecycle with shadow root', function (t) {
      t.plan(2);
      var div = document.createElement('div');
      var root = div.createShadowRoot();
      var eventsFired = {};

      function Test () {
        this.el = el('div');
        this.onmount = function () {
          eventsFired.onmount = true;
        };
        this.onunmount = function () {
          eventsFired.onunmount = true;
        };
      }

      var test = new Test();

      mount(root, test);

      t.equals(eventsFired.onmount, true);
      unmount(root, test);

      t.equals(eventsFired.onunmount, true);
    });
    t.test('component lifecycle events inside node element', function (t) {
      t.plan(1);
      var eventsFired = {};
      function Item () {
        this.el = el('p');
        this.onmount = function () {
          eventsFired.onmount = true;
        };
        this.onremount = function () {
          eventsFired.onremount = true;
        };
        this.onunmount = function () {
          eventsFired.onunmount = true;
        };
      }
      var item = el('wrapper', new Item());
      mount(document.body, item);
      mount(document.body, item);
      unmount(document.body, item);
      t.deepEqual(eventsFired, {
        onmount: true,
        onremount: true,
        onunmount: true
      });
    });
    t.test('lifecycle events on component when child unmounted using setChildren', function (t) {
      t.plan(1);
      var eventsFired = {
        onmount: 0,
        onunmount: 0
      };
      function Item () {
        this.el = el('p');
        this.onmount = function () {
          eventsFired.onmount++;
        };
        this.onunmount = function () {
          eventsFired.onunmount++;
        };
      }
      var item = new Item();
      var item2 = new Item();
      mount(document.body, item);
      setChildren(item.el, [ el('p') ]);
      setChildren(item.el, [ item2 ]);
      unmount(document.body, item);
      t.deepEqual(eventsFired, {
        onmount: 2,
        onunmount: 2
      });
    });
    t.test('lifecycle events on component when child with hooks unmounted using setChildren', function (t) {
      t.plan(1);
      var eventsFired = {
        onmount: 0,
        onunmount: 0
      };
      function MountHook () {
        this.el = el('p');
        this.onmount = function () {
          eventsFired.onmount++;
        };
      }
      function UnmountHook () {
        this.el = el('p');
        this.onunmount = function () {
          eventsFired.onunmount++;
        };
      }
      var mh = new MountHook();
      var uh = new UnmountHook();
      var uh2 = new UnmountHook();
      mount(document.body, uh);
      setChildren(uh.el, [ mh ]);
      setChildren(uh.el, [ uh2 ]);
      unmount(document.body, uh);
      t.deepEqual(eventsFired, {
        onmount: 1,
        onunmount: 2
      });
    });
    t.test('setChildren', function (t) {
      t.plan(4);
      var h1 = el.extend('h1');
      var a = h1('a');
      var b = h1('b');
      var c = text('c');
      setChildren(document.body, [
        a,
        b
      ]);
      t.equals(document.body.innerHTML, '<h1>a</h1><h1>b</h1>');
      setChildren(document.body, a);
      t.equals(document.body.innerHTML, '<h1>a</h1>');

      setChildren(document.body, [[a]], [b, [c]]);
      t.equals(document.body.innerHTML, '<h1>a</h1><h1>b</h1>c');

      setChildren(document.body, el('select', el('option', { value: 1 }), el('option', { value: 2 })));
      t.equals(document.body.innerHTML, '<select><option value="1"></option><option value="2"></option></select>');
    });
    t.test('throw error when no arguments', function (t) {
      t.plan(1);
      t.throws(el, new Error('At least one argument required'));
    });
    t.test('html alias', function (t) {
      t.plan(1);
      t.equals(el, html);
    });
  });

  test('listPool', function (t) {
    t.plan(1);

    listPool(function () {}, null, null);

    t.pass();
  });

  test('list', function (t) {
    t.test('without key', function (t) {
      t.plan(1);

      function Item () {
        this.el = el('li');
        this.update = data => {
          this.el.textContent = data;
        };
      }

      var items = list('ul', Item);
      items.update(); // empty list
      items.update([1, 2, 3]);
      t.equals(items.el.outerHTML, '<ul><li>1</li><li>2</li><li>3</li></ul>');
    });
    t.test('with context', function (t) {
      t.plan(1);

      function Item () {
        this.el = el('li');
        this.update = (data, id, items, context) => {
          this.el.textContent = context + data;
        };
      }

      var items = list(el('ul'), Item);
      items.update();
      items.update([1, 2, 3], 3);
      t.equals(items.el.outerHTML, '<ul><li>4</li><li>5</li><li>6</li></ul>');
    });
    t.test('element parent', function (t) {
      t.plan(1);

      function Item () {
        this.el = el('li');
        this.update = data => {
          this.el.textContent = data;
        };
      }

      var items = list(el('ul'), Item);
      items.update(); // empty list
      items.update([1, 2, 3]);
      t.equals(items.el.outerHTML, '<ul><li>1</li><li>2</li><li>3</li></ul>');
    });
    t.test('component parent', function (t) {
      t.plan(1);

      function Ul () {
        this.el = el('ul');
      }

      function Item () {
        this.el = el('li');
        this.update = data => {
          this.el.textContent = data;
        };
      }

      var ul = new Ul();

      var items = list(ul, Item);
      items.update(); // empty list
      items.update([1, 2, 3]);
      t.equals(items.el.outerHTML, '<ul><li>1</li><li>2</li><li>3</li></ul>');
    });
    t.test('component parent composition', function (t) {
      t.plan(1);

      function Ul () {
        this.el = (new function () {
          this.el = el('ul');
        }());
      }

      function Item () {
        this.el = el('li');
        this.update = data => {
          this.el.textContent = data;
        };
      }

      var ul = new Ul();

      var items = list(ul, Item);
      items.update(); // empty list
      items.update([1, 2, 3]);
      t.equals(items.el.outerHTML, '<ul><li>1</li><li>2</li><li>3</li></ul>');
    });
    t.test('with key', function (t) {
      t.plan(4);

      function Item () {
        this.el = el('li');
        this.update = function (data) {
          this.el.textContent = data.id;
          if (this.data) {
            t.equals(this.data.id, data.id);
          }
          this.data = data;
        };
      }

      var items = list('ul', Item, 'id');

      items.update([{ id: 1 }, { id: 2 }, { id: 3 }]);
      t.equals(items.el.outerHTML, '<ul><li>1</li><li>2</li><li>3</li></ul>');
      items.update([{ id: 2 }, { id: 3 }, { id: 4 }]);
      t.equals(items.el.outerHTML, '<ul><li>2</li><li>3</li><li>4</li></ul>');
    });
    t.test('with function key', function (t) {
      t.plan(4);

      function Item () {
        this.el = el('li');
        this.update = (data) => {
          this.el.textContent = data.id;
          if (this.data) {
            t.equals(this.data.id, data.id);
          }
          this.data = data;
        };
      }

      var items = list('ul', Item, item => item.id);

      items.update([{ id: 1 }, { id: 2 }, { id: 3 }]);
      t.equals(items.el.outerHTML, '<ul><li>1</li><li>2</li><li>3</li></ul>');
      items.update([{ id: 2 }, { id: 3 }, { id: 4 }]);
      t.equals(items.el.outerHTML, '<ul><li>2</li><li>3</li><li>4</li></ul>');
    });
    t.test('adding / removing', function (t) {
      t.plan(3);

      function Item () {
        this.el = el('li');
        this.update = (data) => {
          this.el.textContent = data;
        };
      }

      var items = list('ul', Item);

      items.update([1]);
      t.equals(items.el.outerHTML, '<ul><li>1</li></ul>');
      items.update([1, 2]);
      t.equals(items.el.outerHTML, '<ul><li>1</li><li>2</li></ul>');
      items.update([2]);
      t.equals(items.el.outerHTML, '<ul><li>2</li></ul>');
    });
    t.test('extend', function (t) {
      t.plan(1);

      function Td () {
        this.el = el('td');
        this.update = function (data) {
          this.el.textContent = data;
        };
      }
      var Tr = list.extend('tr', Td);
      var Table = list.extend('table', Tr);

      var table = new Table();

      table.update([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
      t.equals(table.el.outerHTML, '<table><tr><td>1</td><td>2</td><td>3</td></tr><tr><td>4</td><td>5</td><td>6</td></tr><tr><td>7</td><td>8</td><td>9</td></tr></table>');
    });
    t.test('mount / unmount / remount', function (t) {
      t.plan(8);
      function Test () {
        this.el = el('test');
      }
      Test.prototype.onmount = function () {
        t.pass();
      };
      Test.prototype.onremount = function () {
        t.pass();
      };
      Test.prototype.onunmount = function () {
        t.pass();
      };
      var test = new Test();
      setChildren(document.body, []);
      mount(document.body, test); // ONMOUNT pass - 1
      mount(document.body, test); // ONREMOUNT pass - 2
      t.equals(document.body.outerHTML, '<body><test></test></body>'); // pass - 3
      unmount(document.body, test.el); // ONUNMOUNT - 4
      mount(document.body, test.el); // ONMOUNT - 5
      mount(document.body, test.el); // ONREMOUNT - 6
      unmount(document.body, test); // ONUNMOUNT - 7
      t.equals(document.body.outerHTML, '<body></body>'); // pass - 8
    });
    t.test('special cases', function (t) {
      t.plan(1);
      function Td () {
        this.el = el('td');
      }
      Td.prototype.update = function (data) {
        this.el.textContent = data;
      };
      function Tr () {
        this.el = list('tr', Td);
      }
      Tr.prototype.update = function (data) {
        this.el.update(data);
      };
      function Table () {
        this.el = list('table', Tr);
      }
      Table.prototype.update = function (data) {
        this.el.update(data);
      };
      var table = new Table();
      table.update([[1, 2, 3]]);
      setChildren(document.body, []);
      mount(document.body, table);
      t.equals(document.body.innerHTML, '<table><tr><td>1</td><td>2</td><td>3</td></tr></table>');
    });
    t.test('unmounting unmounted', function (t) {
      t.plan(2);
      function Test () {
        this.el = el('div');
      }
      var test = new Test();
      unmount(document.body, test);
      mount(document.body, test);
      t.equals(document.body.contains(test.el), true);
      unmount(document.body, test);
      t.equals(document.body.contains(test.el), false);
    });
  });

  test('SVG', function (t) {
    t.test('creation', function (t) {
      t.plan(2);

      var circle = svg('circle');
      t.equals(circle instanceof SVGElement, true);
      t.equals(circle.outerHTML, '<circle></circle>');
    });
    t.test('one class', function (t) {
      t.plan(2);
      var circle = svg('circle.giraffe');
      t.equals(circle instanceof SVGElement, true);
      t.equals(circle.outerHTML, '<circle class="giraffe"></circle>');
    });
    t.test('multiple class', function (t) {
      t.plan(2);
      var circle = svg('circle.giraffe.dog');
      t.equals(circle instanceof SVGElement, true);
      t.equals(circle.outerHTML, '<circle class="giraffe dog"></circle>');
    });
    t.test('ID', function (t) {
      t.plan(2);
      var circle = svg('circle#monkey');
      t.equals(circle instanceof SVGElement, true);
      t.equals(circle.outerHTML, '<circle id="monkey"></circle>');
    });
    t.test('parameters', function (t) {
      t.plan(1);

      var circle = svg('circle', { cx: 1, cy: 2, r: 3 });
      t.equals(circle.outerHTML, '<circle cx="1" cy="2" r="3"></circle>');
    });
    t.test('event handler', function (t) {
      t.plan(1);

      var circle = svg('circle', { onclick: e => t.pass() });
      circle.dispatchEvent(new CustomEvent('click', {}));
    });
    t.test('Style string', function (t) {
      t.plan(1);

      var circle = svg('circle', { style: 'color: red;' });
      t.equals(circle.outerHTML, '<circle style="color: red;"></circle>');
    });
    t.test('Style object', function (t) {
      t.plan(1);

      var circle = svg('circle', { style: { color: 'red' } });
      t.equals(circle.outerHTML, '<circle style="color: red;"></circle>');
    });
    t.test('with text', function (t) {
      t.plan(1);

      var text = svg('text', 'Hello!');
      t.equals(text.outerHTML, '<text>Hello!</text>');
    });
    t.test('append text', function (t) {
      t.plan(t);

      var text = svg('text', 'Hello', ' ', 'world!');
      t.equals(text.outerHTML, '<text>Hello world!</text>');
    });
    t.test('extend cached', function (t) {
      t.plan(1);

      var Circle = svg.extend('circle');
      var circle = new Circle();
      t.equals(circle.outerHTML, '<circle></circle>');
    });
    t.test('extend', function (t) {
      t.plan(1);

      var Line = svg.extend('line');
      var line = new Line();
      t.equals(line.outerHTML, '<line></line>');
    });
    t.test('children', function (t) {
      t.plan(1);

      var graphic = svg('svg',
        svg('circle', { cx: 1, cy: 2, r: 3 })
      );
      t.equals(graphic.outerHTML, '<svg><circle cx="1" cy="2" r="3"></circle></svg>');
    });
    t.test('child view', function (t) {
      t.plan(1);

      function Circle () {
        this.el = svg('circle', { cx: 1, cy: 2, r: 3 });
      }

      var graphic = svg('svg',
        new Circle()
      );
      t.equals(graphic.outerHTML, '<svg><circle cx="1" cy="2" r="3"></circle></svg>');
    });
    t.test('middleware', function (t) {
      t.plan(1);

      var graphic = svg('svg',
        function (svg) {
          svg.setAttribute('ok', '!');
        },
        svg('circle', { cx: 1, cy: 2, r: 3 })
      );
      t.equals(graphic.outerHTML, '<svg ok="!"><circle cx="1" cy="2" r="3"></circle></svg>');
    });
    t.test('throw error when no arguments', function (t) {
      t.plan(1);
      t.throws(svg, new Error('At least one argument required'));
    });
    t.test('xlink + remove', function (t) {
      t.plan(2);

      var use = svg('use', { xlink: { href: '#menu' } });
      t.equals(use.outerHTML, '<use xlink:href="#menu"></use>');

      setXlink(use, 'href', null);
      t.equals(use.outerHTML, '<use></use>');
    });
  });

  test('router', function (t) {
    t.plan(2);
    function A () {
      this.el = el('a');
    }
    A.prototype.update = function (val) {
      this.el.textContent = val;
    };

    function B () {
      this.el = el('b');
    }

    B.prototype.update = function (val) {
      this.el.textContent = val;
    };

    var _router = router('.test', {
      a: A,
      b: B
    });
    _router.update('a', 1);
    t.equals(_router.el.outerHTML, '<div class="test"><a>1</a></div>');
    _router.update('b', 2);
    t.equals(_router.el.outerHTML, '<div class="test"><b>2</b></div>');
  });
  test('router with elements', function (t) {
    t.plan(2);

    var _router = router('.test', {
      a: el('.a'),
      b: el('.b')
    });

    _router.update('a');
    t.equals(_router.el.outerHTML, '<div class="test"><div class="a"></div></div>');

    _router.update('b');
    t.equals(_router.el.outerHTML, '<div class="test"><div class="b"></div></div>');
  });
  test('router with component instances', function (t) {
    t.plan(2);

    function A () {
      this.el = el('.a');
    }

    function B () {
      this.el = el('.b');
    }

    var _router = router('.test', {
      a: new A(),
      b: new B()
    });

    _router.update('a');
    t.equals(_router.el.outerHTML, '<div class="test"><div class="a"></div></div>');

    _router.update('b');
    t.equals(_router.el.outerHTML, '<div class="test"><div class="b"></div></div>');
  });
  test('lifecycle event order consistency check', function (t) {
    t.plan(1);
    var logs = [];

    var nApexes = 3;
    var nLeaves = 2;
    var nBranches = 1;

    function Base (name, content) {
      var _el = html('', content);

      function onmount () {
        logs.push(name + ' mounted: ' + (typeof _el.getBoundingClientRect()));
      }

      function onunmount () {
        logs.push(name + ' unmount: ' + (typeof _el.getBoundingClientRect()));
      }

      return { el: _el, onmount, onunmount };
    }

    function Apex () {
      return Base('Apex');
    }

    function Leaf () {
      var size = nApexes;
      var apexes = [];
      for (var i = 0; i < size; i++) {
        apexes.push(Apex());
      }
      return Base('Leaf', apexes);
    }

    function Branch () {
      var size = nLeaves;
      var leaves = [];
      for (var i = 0; i < size; i++) {
        leaves.push(Leaf());
      }
      return Base('Branch', leaves);
    }

    function Tree () {
      var size = nBranches;
      var branches = [];
      for (var i = 0; i < size; i++) {
        branches.push(Branch());
      }
      return Base('Tree', branches);
    }

    var expectedLog = [];
    // onmount -- mounted
    expectedLog.push('Tree mounted: object');
    for (let i = 0; i < nBranches; i++) {
      expectedLog.push('Branch mounted: object');
      for (let j = 0; j < nLeaves; j++) {
        expectedLog.push('Leaf mounted: object');
        for (let k = 0; k < nApexes; k++) {
          expectedLog.push('Apex mounted: object');
        }
      }
    }

    // onunmount -- unmounting
    expectedLog.push('Tree unmount: object');
    for (let i = 0; i < nBranches; i++) {
      expectedLog.push('Branch unmount: object');
      for (let j = 0; j < nLeaves; j++) {
        expectedLog.push('Leaf unmount: object');
        for (let k = 0; k < nApexes; k++) {
          expectedLog.push('Apex unmount: object');
        }
      }
    }

    var tree = Tree();
    mount(document.body, tree);
    unmount(document.body, tree);

    t.deepEqual(logs, expectedLog);
  });

  test('element place', function (t) {
    t.plan(3);

    var elementPlace = place(el('h1', 'Hello RE:DOM!'));

    setChildren(document.body, []);

    mount(document.body, elementPlace);
    mount(document.body, el('p', 'After'));
    t.equals(document.body.innerHTML, '<p>After</p>');

    elementPlace.update(true);
    t.equals(document.body.innerHTML, '<h1>Hello RE:DOM!</h1><p>After</p>');

    elementPlace.update(false);
    t.equals(document.body.innerHTML, '<p>After</p>');

    elementPlace.update(true);
  });

  test('extended element place', function (t) {
    t.plan(3);

    var elementPlace = place(el.extend('h1', 'Hello RE:DOM!'));

    setChildren(document.body, []);

    mount(document.body, elementPlace);
    mount(document.body, el('p', 'After'));
    t.equals(document.body.innerHTML, '<p>After</p>');

    elementPlace.update(true);
    t.equals(document.body.innerHTML, '<h1>Hello RE:DOM!</h1><p>After</p>');

    elementPlace.update(false);
    t.equals(document.body.innerHTML, '<p>After</p>');

    elementPlace.update(true);
  });

  test('component place', function (t) {
    t.plan(3);

    function B (initData) {
      this.el = el('.b', 'place!');

      t.equals(initData, 1);
    }

    B.prototype.update = function (data) {
      this.el.textContent = data;
    };

    function A () {
      this.el = el('.a',
        this.place = place(B, 1)
      );
    }

    var a = new A();

    mount(document.body, a);

    a.place.update(true, 2);

    t.equals(a.el.innerHTML, '<div class="b">2</div>');

    a.place.update(false, 2);

    t.equals(a.el.innerHTML, '');
    unmount(document.body, a);
  });

  test('component instance place', function (t) {
    t.plan(2);

    function B (initData) {
      this.el = el('.b', 'place!');
    }

    B.prototype.update = function (data) {
      this.el.textContent = data;
    };

    function A () {
      this.el = el('.a',
        this.place = place(new B())
      );
    }

    var a = new A();

    mount(document.body, a);

    a.place.update(true, 2);

    t.equals(a.el.innerHTML, '<div class="b">2</div>');

    a.place.update(false);

    t.equals(a.el.innerHTML, '');
    unmount(document.body, a);
  });

  test('component moved below non-redom element', function (t) {
    t.plan(3);
    var div = document.createElement('div');
    document.body.appendChild(div);
    var targetDiv = document.createElement('div');
    document.body.appendChild(targetDiv);

    function Item () {
      this.el = el('p');
      this.onmount = function () {};
    }

    var item = new Item();
    mount(div, item);
    t.deepEquals(div.__redom_lifecycle, { onmount: 1 });

    targetDiv.appendChild(div);
    t.strictEquals(targetDiv.__redom_lifecycle, undefined);
    
    unmount(div, item);
    t.strictEquals(targetDiv.__redom_lifecycle, undefined);
  });

  test('optimized list diff', function (t) {
    t.plan(1);
    var remounts = 0;

    function Item () {
      this.el = el('p');
      this.onremount = function () {
        remounts++;
      };
    }
    var items = list(el('list'), Item, 'id');

    items.update('a b c d e f g'.split(' ').map(function (id) { return { id: id }; }));
    items.update('a e c d b f g'.split(' ').map(function (id) { return { id: id }; }));

    t.equals(remounts, 1);
  });

  test('make sure setChildren unmount with normal div in between calls the lifecycle of all children', function (t) {
    t.plan(8);

    var mounts = 0;
    var unmounts = 0;

    function onmount() {
      mounts += 1;
    }
    function onunmount() {
      unmounts += 1;
    }


    function Child () {
      this.el = document.createElement('div');
      this.onmount = onmount;
      this.onunmount = onunmount;
    }

    function Parent () {
      this.content = document.createElement('div');
      this.el = document.createElement('div');
      this.el.appendChild(this.content);
      this.onmount = onmount
      this.onunmount = onunmount;
    }

    function Top() {
      this.el = document.createElement('div');
    }

    var parent = new Parent();

    // Mount into dom
    var base = document.createElement('div');
    document.body.appendChild(base);
    var top = new Top();
    t.equals(top.el.__redom_lifecycle, undefined);

    mount(base, top);
    mount(top, parent);
    setChildren(parent.content, new Child()); 
    t.equals(mounts, 2);
    t.equals(unmounts, 0);
    setChildren(parent.content, new Child()); 
    t.equals(mounts, 3);
    t.equals(unmounts, 1);

    // Now the failure: unmount the parent and child onunmount was not called when a div in between in some cases
    unmount(top, parent);
    t.equals(unmounts, 3);

    // Check that we are not leaving wrong counters above
    t.equals(top.el.__redom_lifecycle.onmount, 0);
    t.equals(top.el.__redom_lifecycle.onunmount, 0);
  });

  test('test deep unmount', function (t) {
    t.plan(1);
    var unmounts = 0;
    var deeptree = document.createElement('div')
    deeptree.appendChild(document.createElement('div'))
    deeptree.firstChild.appendChild(document.createElement('div'))
    deeptree.firstChild.firstChild.appendChild(document.createElement('div'))

    function DeepComponent() {
      this.el = el('div')
      this.onunmount = function () {
        unmounts += 1;
      }
    }

    function TopComponent() {
      this.el = el('div');
      this.onunmount = function () {
        unmounts += 1;
      }
    }

    var top = new TopComponent();
    var deep = new DeepComponent();
    mount(document.body, top);
    mount(top, deeptree);
    mount(deeptree.firstChild.firstChild.firstChild, deep);
    unmount(document.body, top);
    t.equals(unmounts, 2);
  });
};
