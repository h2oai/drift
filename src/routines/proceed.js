import { render_ } from './render_';

export function proceed(_, func, args, go) {
  console.log('arguments from proceed', arguments);
  return go(null, render_(...[
    _,
    {},
    func,
  ].concat(args || [])));
}
