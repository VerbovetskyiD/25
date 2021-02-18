// 1
console.info('foo');
console.info('bar');
console.info('baz');
// код выполняется синхронно:
// 1 - 'foo'
// 2 - 'bar'
// 3 - 'baz'

// 2
console.info('foo');
setTimeout(() => console.info('bar'), 1000);
console.info('baz');
// setTimeout - попадая в call stack - отправляется в Web API
// на выполнение, после выполнения попадает в callback queue
// откуда event loop-ом перемещается в call stack (если он пустой):
// 1 - 'foo'
// 2 - 'baz'
// 3 - 'bar'

// 3
console.info('foo');
setTimeout(() => console.info('bar'), 0);
console.info('baz');
// аналогично с вариантом выше. таймер не имеет значения, т.к. setTimeout
// всё равно должен сначала отправиться в Web API на выполнение,
// а после в callback queue:
// 1 - 'foo'
// 2 - 'baz'
// 3 - 'bar'

// 4
const timer = setInterval(() => {
  console.info('foo');
  setTimeout(() => clearTimeout(timer), 0);
}, 1000);
setTimeout(() => console.info('bar'), 1000);
console.info('baz');
// сначала синхронный код, после - функции из callback queue в порядке
// первенства (first in, first out):
// 1 - 'baz'
// 2 - 'foo'
// 3 - 'bar'

// 5
const timer = setInterval(() => {
  setTimeout(() => {
    console.info('foo');
    clearTimeout(timer);
  }, 0);
}, 1000);
setTimeout(() => console.info('bar'), 1000);
console.info('baz');
// аналогично с вариантом выше. только сдесь console.info записан в
// setTimeout, поэтому вывод будет:
// 1 - 'baz'
// 2 - 'bar'
// 3 - 'foo'

// 6
Promise.resolve('foo').then(res => console.info(res));
setTimeout(() => console.info('bar'), 0);
console.info('baz');
// промисы попадают в job queue, которая имеет приоритет над
// callback queue:
// 1 - 'baz'
// 2 - 'foo'
// 3 - 'bar'

// 7
setTimeout(() => console.info('foo'), 0);
Promise.resolve('bar').then(res => console.info(res));
console.info('baz');
setTimeout(() => console.info('foo2'), 0);
Promise.resolve('bar2').then(res => console.info(res));
console.info('baz2');
// сначала синхронный код, потом промисы по-порядку, потом таймеры:
// 1 - 'baz'
// 2 - 'baz2'
// 3 - 'bar'
// 4 - 'bar2'
// 5 - 'foo'
// 6 - 'foo'

// 8
setTimeout(() => Promise.resolve('foo').then(res => console.info(res)), 1000);

Promise.resolve('bar').then(res => {
  setTimeout(() => console.info(res), 1000);
});

console.info('baz');
// сдесь 'foo' попадает в job queue раньше чем в 9 варианте:
// 1 - 'baz'
// 2 - 'foo'
// 3 - 'bar'

// 9
setTimeout(() => Promise.resolve('foo').then(res => console.info(res)), 1000);
Promise.resolve('bar').then(res => {
  setTimeout(() => console.info(res), 500);
});
console.info('baz');
// а тут 'bar' раньше:
// 1 - 'baz'
// 2 - 'bar'
// 3 - 'foo'

// 10
(async () => {
  const result = await Promise.resolve('foo');
  console.info(result);
})();
setTimeout(() => console.info('bar'), 0);
console.info('baz');
// iife - выполняется и возвращает значение:
// 1 - 'baz'
// 2 - 'foo'
// 3 - 'bar'

// 11
setTimeout(console.info('foo'), 0);
console.info('bar');
(async () => {
  const result = await Promise.resolve('baz');
  console.info(result);
})();
// аналогично с вариантом выше
// 1 - 'bar'
// 2 - 'baz'
// 3 - 'foo'
