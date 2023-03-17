/* eslint-disable no-param-reassign */
/* eslint-disable no-nested-ternary */
/* eslint-disable prettier/prettier */
import * as d3 from "d3";

export default function Tree(
  data,
  {
    // data is either tabular (array of objects) or hierarchy (nested objects)
    path, // as an alternative to id and parentId, returns an array identifier, imputing internal nodes
    id = Array.isArray(data) ? d => d.id : null, // if tabular data, given a d in data, returns a unique identifier (string)
    parentId = Array.isArray(data) ? d => d.parentId : null, // if tabular data, given a node d, returns its parent’s identifier
    children, // if hierarchical data, given a d in data, returns its children
    tree = d3.tree, // layout algorithm (typically d3.tree or d3.cluster)
    sort, // how to sort nodes prior to layout (e.g., (a, b) => d3.descending(a.height, b.height))
    label, // given a node d, returns the display name
    title, // given a node d, returns its hover text
    link, // given a node d, its link (if any)
    linkTarget = "_blank", // the target attribute for links (if any)
    width, // outer width, in pixels
    height = 1000, // outer height, in pixels
    r = 30, // radius of nodes
    padding = 5, // horizontal padding for first and last column // 증가하면 가지가 짧아집니다.
    fill = "#999", // fill for nodes
    // fillOpacity, // fill opacity for nodes
    stroke = "#555", // stroke for links
    strokeWidth = 10, // stroke width for links
    strokeOpacity = 0.4, // stroke opacity for links
    strokeLinejoin, // stroke line join for links
    strokeLinecap, // stroke line cap for links
    halo = "#fff", // color of label halo
    haloWidth = 5, // padding around the labels // 증가하면 글자 흰 테두리가 커집니다.
    curve = d3.curveBumpX, // curve for the link
  } = {},
) {
  // If id and parentId options are specified, or the path option, use d3.stratify
  // to convert tabular data to a hierarchy; otherwise we assume that the data is
  // specified as an object {children} with nested objects (a.k.a. the “flare.json”
  // format), and use d3.hierarchy.
  const root =
    path != null
      ? d3.stratify().path(path)(data)
      : id != null || parentId != null
      ? d3.stratify().id(id).parentId(parentId)(data)
      : d3.hierarchy(data, children);

  // Sort the nodes.
  if (sort != null) root.sort(sort);

  // Compute labels and titles.
  const descendants = root.descendants();
  const L = label === null ? null : descendants.map(d => label(d.data, d));

  // Compute the layout.
  const dx = 300; // 증가하면 노드끼리 멀어집니다.
  const dy = width / (root.height + padding);
  tree().nodeSize([dx, dy])(root);

  // Center the tree.
  let x0 = Infinity;
  let x1 = -x0;
  root.each(d => {
    if (d.x > x1) x1 = d.x;
    if (d.x < x0) x0 = d.x;
  });

  // Compute the default height.
  if (height === undefined) height = x1 - x0 + dx * 2;

  // Use the required curve
  if (typeof curve !== "function") throw new Error(`Unsupported curve`);

  const svg = d3
    .create("svg")
    .attr("viewBox", [(-dy * padding) / 2, x0 - dx, width, height])
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
    ); // (1) x y 바꾸고

  const node = svg
    .append("g")
    .selectAll("a")
    .data(root.descendants())
    .join("a")
    .attr("xlink:href", link === null ? null : d => link(d.data, d))
    .attr("target", link === null ? null : linkTarget)
    .attr("transform", d => `translate(${d.x},${d.y})`); // (2) x y 바꾸면 가로세로 바뀝니다.

  node
    .append("circle")
    .attr("fill", d => (d.children ? stroke : fill))
    .attr("r", r);

  if (title != null) node.append("title").text(d => title(d.data, d));

  if (L)
    node
      .append("text")
      .attr("dy", "1.5em")
      // .attr("x", d => d.children ? -6 : 6)
      .attr("text-anchor", "middle") // 노드 텍스트 위치 변경
      .attr("paint-order", "stroke")
      .attr("stroke", halo)
      .attr("stroke-width", haloWidth)
      .text((d, i) => L[i]);

  return svg.node();
}
