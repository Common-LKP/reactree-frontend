/* eslint-disable prefer-destructuring */
import {
  curveBumpX,
  hierarchy,
  tree,
  create,
  link,
  zoom,
  drag,
  select,
} from "d3";

export default function getTreeSVG(
  data,
  {
    children,
    label,
    width,
    height,
    r = 10,
    padding = 0.01,
    curve = curveBumpX,
  } = {},
) {
  const root = hierarchy(data, children);
  const descendants = root.descendants();
  const labelList = descendants.map(d => label(d.data, d));

  const svg = create("svg");
  let xSpacing = 0;
  let ySpacing = 0;
  let vx = -width / 2;
  let vy = -50;
  let vw = width;
  let vh = height;
  let scale = 1;

  function drawTree() {
    const dx = xSpacing || width / (root.height + padding);
    const dy = ySpacing || 50;
    tree().nodeSize([dx, dy])(root);

    const minZoom = 0.5;
    const maxZoom = 2;
    const labelY = 1.5;
    const labelFontSize = 10;

    svg
      .attr("viewBox", [vx, vy, vw, vh])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
      .attr("cursor", "pointer")
      .attr("font-family", "sans-serif")
      .attr("font-size", labelFontSize)
      .call(
        drag()
          .on("start", event => {
            svg.attr("cursor", "grab");

            vx += event.x * scale;
            vy += event.y * scale;
          })
          .on("drag", event => {
            svg.attr("cursor", "grabbing");

            const newX = vx - event.x * scale;
            const newY = vy - event.y * scale;

            svg.attr("viewBox", [newX, newY, vw, vh]);
          })
          .on("end", () => {
            svg.attr("cursor", "pointer");
            vx = svg.attr("viewBox").split(",").map(Number)[0];
            vy = svg.attr("viewBox").split(",").map(Number)[1];
          }),
      );

    svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke", "#666666")
      .attr("stroke-opacity", 5)
      .attr("stroke-width", 3)
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
      .attr("fill", d => (d.data.tag === 0 ? "#7289da" : "#999"))
      .attr("r", r);

    if (labelList)
      node
        .append("text")
        .attr("dy", `${labelY}em`)
        .attr("text-anchor", "middle")
        .attr("paint-order", "stroke")
        .attr("stroke", "#fff")
        .attr("stroke-width", 4)
        .text((d, i) => labelList[i]);

    svg.call(
      zoom()
        .extent([
          [0, 0],
          [width, height],
        ])
        .scaleExtent([minZoom, maxZoom])
        .on("start", () => {
          vw /= scale;
          vh /= scale;
        })
        .on("zoom", event => {
          const { k } = event.transform;
          svg.attr("viewBox", [vx, vy, vw * k, vh * k]);
          node.select("circle").attr("r", r / k);
          node
            .select("text")
            .attr("dy", `${labelY / k + labelY / r}em`)
            .attr("font-size", labelFontSize / k);
        })
        .on("end", event => {
          scale = event.transform.k;
          vw = svg.attr("viewBox").split(",").map(Number)[2];
          vh = svg.attr("viewBox").split(",").map(Number)[3];
        }),
    );
  }

  drawTree();

  select("#sliderX").on("input", event => {
    xSpacing = Number(event.target.value);
    select(".svg svg g").remove();
    select(".svg svg g").remove();
    drawTree();
  });

  select("#sliderY").on("input", event => {
    ySpacing = Number(event.target.value);
    select(".svg svg g").remove();
    select(".svg svg g").remove();
    drawTree();
  });

  return svg.node();
}
