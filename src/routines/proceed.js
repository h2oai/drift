import { render_ } from './render_';

export function proceed(_, func, args, go) {
  console.log('arguments passed to proceed', arguments);
  console.log('_ from proceed', _);
  console.log('func from proceed', _);
  return go(null, render_(_, ...[
    {},
    func,
  ].concat(args || [])));
}