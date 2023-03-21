import { curveBumpX, hierarchy, tree, create, link, zoom, drag } from "d3";

export default function getTreeSVG(
  data,
  {
    children,
    label,
    width,
    height,
    r = 10,
    padding = 0.01,
    fill = "#999",
    stroke = "#300",
    strokeWidth = 3,
    strokeOpacity = 5,
    strokeLinejoin,
    strokeLinecap,
    halo = "#fff",
    haloWidth = 4,
    dxWidth,
    dyHeight,
    curve = curveBumpX,
  } = {},
) {
  const root = hierarchy(data, children);
  const descendants = root.descendants();
  const L = descendants.map(d => label(d.data, d));
  const dx = dxWidth || width / (root.height + padding);
  const dy = dyHeight || 50;
  tree().nodeSize([dx, dy])(root);

  const viewBox = [-width / 2, -dy, width, height];
  const minZoom = 0.5;
  const maxZoom = 2;
  const labelY = 1.5;
  const labelFontSize = 10;

  const svg = create("svg")
    .attr("viewBox", viewBox)
    .attr("width", width)
    .attr("height", height)
    .attr(
      "style",
      "max-width: 100%; height: auto; height: intrinsic; background: gray",
    )
    .attr("cursor", "pointer")
    .attr("font-family", "sans-serif")
    .attr("font-size", labelFontSize)
    .call(
      drag()
        .on("start", event => {
          svg.attr("cursor", "grab");
          const [newVX, newVY, newVW, newVH] = svg
            .attr("viewBox")
            .split(",")
            .map(Number);
          const scale = svg.attr("transform-scale") || 1;

          svg.attr("vx-start", newVX + event.x * scale);
          svg.attr("vy-start", newVY + event.y * scale);
          svg.attr("vw-start", newVW);
          svg.attr("vh-start", newVH);
        })
        .on("drag", event => {
          svg.attr("cursor", "grabbing");

          const scale = svg.attr("transform-scale") || 1;
          const newX = Number(svg.attr("vx-start")) - event.x * scale;
          const newY = Number(svg.attr("vy-start")) - event.y * scale;
          const newWidth = svg.attr("vw-start");
          const newHeight = svg.attr("vh-start");

          svg.attr("viewBox", [newX, newY, newWidth, newHeight]);
        })
        .on("end", () => svg.attr("cursor", "pointer")),
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

  svg.call(
    zoom()
      .extent([
        [0, 0],
        [width, height],
      ])
      .scaleExtent([minZoom, maxZoom])
      .on("start", () => {
        const scale = svg.attr("transform-scale") || 1;
        const [vx, vy, vw, vh] = svg.attr("viewBox").split(",").map(Number);
        svg.attr("viewBox-start", [vx, vy, vw / scale, vh / scale]);
      })
      .on("zoom", event => {
        const { k } = event.transform;
        const [vx, vy, vw, vh] = svg
          .attr("viewBox-start")
          .split(",")
          .map(Number);
        svg.attr("viewBox", [vx, vy, vw * k, vh * k]);
        node.select("circle").attr("r", r / k);
        node
          .select("text")
          .attr("dy", `${labelY / k + labelY / r}em`)
          .attr("font-size", labelFontSize / k);
      })
      .on("end", event => {
        svg.attr("transform-scale", event.transform.k);
      }),
  );

  return svg.node();
}
