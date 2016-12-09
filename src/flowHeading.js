export function flowHeading(_, level) {
  let render;
  render = (input, output) => {
    output.data({
      text: input.trim() || '(Untitled)',
      template: `flow-${level}`
    });
    return output.end();
  };
  render.isCode = false;
  return render;
}
