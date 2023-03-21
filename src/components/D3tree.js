/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { hierarchy } from "d3";

import Modal from "./Modal";
import getTreeSVG from "../utils/getTreeSVG";
import createNode from "../utils/reactFiberTree";
import Node from "../utils/Node";
import mockTreeData from "../assets/mockTreeData.json";
import { COLORS } from "../assets/constants";

const Wrapper = styled.div`
  height: 100%;
  overflow: hidden;

  .svg {
    height: 100%;
  }

  .modal {
    color: ${COLORS.BUTTON};
    position: absolute;
  }
`;

export default function D3Tree() {
  const { layoutWidth, layoutHeight } = useSelector(state => state.d3tree);
  const [hierarchyData, setHierarchyData] = useState(hierarchy(mockTreeData));
  const fiberTree = new Node();

  const getTreeData = async function () {
    try {
      await window.electronAPI.getNodeData((event, value) => {
        createNode(value, fiberTree);
        setHierarchyData(hierarchy(fiberTree));
      });
    } catch (error) {
      console.error(error);
    }
  };

  const svg = useRef();
  const [nodeId, setNodeId] = useState("");
  const [nodeName, setNodeName] = useState("");
  const [nodeProps, setNodeProps] = useState(null);
  const [nodeState, setNodeState] = useState(null);

  useEffect(() => {
    getTreeData();

    const chart = getTreeSVG(hierarchyData.data, {
      label: d => d.name,
      width: layoutWidth,
      height: layoutHeight,
      dxWidth: null,
      dyHeight: null,
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
          setNodeId(nodeData.data.uuid);
          setNodeName(nodeData.data.name);
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
        setNodeName(null);
        setNodeProps(null);
        setNodeState(null);
      });
    });
  }, [hierarchyData, layoutWidth, layoutHeight]);

  return (
    <Wrapper>
      <div ref={svg} className="svg" />
      <div className="modal">
        <Modal nodeId={nodeId}>
          <div>name: {nodeName}</div>
          <div>props: {nodeProps}</div>
          <div>state: {nodeState}</div>
        </Modal>
      </div>
    </Wrapper>
  );
}
