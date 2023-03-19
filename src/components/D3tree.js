import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { hierarchy } from "d3";
import Modal from "./Modal";
import getTreeSVG from "../utils/getTreeSVG";
import createNode from "../utils/reactFiberTree";
import Node from "../utils/Node";
import mockTreeData from "../assets/mockTreeData.json";

const Wrapper = styled.div`
  .modal {
    position: absolute;
  }
`;

export default function D3Tree() {
  const [hierarchyData, hierarchySetData] = useState(hierarchy(mockTreeData));
  const fiberTree = new Node();

  const getTreeData = async function () {
    try {
      await window.electronAPI.fiberData((event, value) => {
        createNode(value, fiberTree);
        hierarchySetData(hierarchy(fiberTree));
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getTreeData();
  });

  const svg = useRef();
  const [nodeId, setNodeId] = useState("");
  const [nodeProps, setNodeProps] = useState(null);
  const [nodeState, setNodeState] = useState(null);

  useEffect(() => {
    const chart = getTreeSVG(hierarchyData.data, {
      label: d => d.name,
    });

    if (svg.current.firstChild) svg.current.removeChild(svg.current.firstChild);
    svg.current.appendChild(chart);

    const modal = document.querySelector(".modal");
    const componentNodes = document.querySelectorAll("svg circle");

    componentNodes.forEach(node => {
      node.addEventListener("mouseover", event => {
        const nodeData = hierarchyData.find(
          d => d.data.uuid === event.target.id,
        );
        if (nodeData) {
          setNodeId(nodeData.data.name);
          setNodeProps(nodeData.data.props.join(", "));
          setNodeState(nodeData.data.state.join(", "));
        }
      });
      node.addEventListener("mousemove", event => {
        modal.style.left = `${event.clientX + 10}px`;
        modal.style.top = `${event.clientY - modal.clientHeight - 10}px`;
      });
      node.addEventListener("mouseout", () => {
        setNodeId(null);
        setNodeProps(null);
        setNodeState(null);
      });
    });
  }, [hierarchyData]);

  return (
    <Wrapper>
      <div ref={svg} />
      <div className="modal">
        <Modal nodeId={nodeId}>
          <div>name: {nodeId}</div>
          <div>props: {nodeProps}</div>
          <div>state: {nodeState}</div>
        </Modal>
      </div>
    </Wrapper>
  );
}
