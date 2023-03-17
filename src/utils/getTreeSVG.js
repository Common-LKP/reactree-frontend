import * as d3 from "d3";

export default function getTreeSVG(
  data,
  {
    children,
    label,
    width,
    height,
    r = 30,
    padding = 1,
    fill = "#999",
    stroke = "#555",
    strokeWidth = 10,
    strokeOpacity = 0.4,
    strokeLinejoin,
    strokeLinecap,
    halo = "#fff",
    haloWidth = 4,
    curve = d3.curveBumpX,
  } = {},
) {
  const root = d3.hierarchy(data, children);

  const descendants = root.descendants();
  const L = descendants.map(d => label(d.data, d));

  const dx = 100;
  const dy = width / (root.height + padding);
  d3.tree().nodeSize([dx, dy])(root);

  const svg = d3
    .create("svg")
    .attr("viewBox", [-400, -100, width, height])
    .attr("width", width)
    .attr("height", height)
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
    .attr("font-family", "sans-serif")
    .attr("font-size", 30);

  svg
    .append("g")
    .attr("fill", "none")
    .attr("stroke", stroke)
    .attr("stroke-opacity", strokeOpacity)
    .attr("stroke-linecap", strokeLinecap)
    .attr("stroke-linejoin", strokeLinejoin)
    .attr("stroke-width", strokeWidth)
    .selectAll("path")
    .data(root.links())
    .join("path")
    .attr(
      "d",
      d3
        .link(curve)
        .x(d => d.x)
        .y(d => d.y),
    );

  const node = svg
    .append("g")
    .selectAll("a")
    .data(root.descendants())
    .join("a")
    .attr("transform", d => `translate(${d.x},${d.y})`);

  node
    .append("circle")
    .attr("id", d => d.data.name)
    .attr("fill", d => (d.children ? stroke : fill))
    .attr("r", r);

  if (L)
    node
      .append("text")
      .attr("dy", "1.5em")
      .attr("text-anchor", "middle")
      .attr("paint-order", "stroke")
      .attr("stroke", halo)
      .attr("stroke-width", haloWidth)
      .text((d, i) => L[i]);

  return svg.node();
}
