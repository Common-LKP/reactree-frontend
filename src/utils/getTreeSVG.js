/* eslint-disable no-use-before-define */
import { curveBumpX, hierarchy, tree, create, link, zoom } from "d3";

export default function getTreeSVG(
  data,
  {
    children,
    label,
    width = 800,
    height = 800,
    r = 20,
    padding = 0.01,
    fill = "#999",
    stroke = "#555",
    strokeWidth = 10,
    strokeOpacity = 0.4,
    strokeLinejoin,
    strokeLinecap,
    halo = "#fff",
    haloWidth = 4,
    curve = curveBumpX,
  } = {},
) {
  const root = hierarchy(data, children);

  const descendants = root.descendants();
  const L = descendants.map(d => label(d.data, d));

  const dx = width / (root.height + padding);
  const dy = 50;
  tree().nodeSize([dx, dy])(root);

  const viewBox = [-width / 2, -dy, width, height];
  const minZoom = 0.5;
  const maxZoom = 2;
  const labelY = 1.5;
  const labelFontSize = 30;

  const svg = create("svg")
    .attr("viewBox", viewBox)
    .attr("width", width)
    .attr("height", height)
    .attr(
      "style",
      "max-width: 100%; height: auto; height: intrinsic; background-color: gray;",
    )
    .attr("font-family", "sans-serif")
    .attr("font-size", 30)
    .call(
      zoom()
        .extent([
          [0, 0],
          [width, height],
        ])
        .scaleExtent([minZoom, maxZoom])
        .on("zoom", function (event) {
          const { x, y, k } = event.transform;
          const [vx, vy, vw, vh] = viewBox;
          svg.attr("viewBox", [vx + x, vy + y, vw * k, vh * k]);
          node.attr("transform", d => `translate(${d.x},${d.y}) scale(${k})`);
          node.select("circle").attr("r", r / k);
          node
            .select("text")
            .attr("dy", `${labelY / k + labelY / r}em`)
            .attr("font-size", labelFontSize / k);
        }),
    );

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
      link(curve)
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
    .attr("id", d => d.data.uuid)
    .attr("fill", d => (d.children ? stroke : fill))
    .attr("r", r);

  if (L)
    node
      .append("text")
      .attr("dy", `${labelY}em`)
      .attr("text-anchor", "middle")
      .attr("paint-order", "stroke")
      .attr("stroke", halo)
      .attr("stroke-width", haloWidth)
      .text((d, i) => L[i]);

  return svg.node();
}
