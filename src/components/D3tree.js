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
import { COLORS, SIZE } from "../assets/constants";

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

  .modal .info-row {
    display: flex;
    margin: 5px 0;

    .title {
      width: 60px;
      min-width: 60px;
      font-weight: 700;
    }

    .description {
      width: auto;
      min-width: 130px;
      text-align: left;
    }
  }
`;

export default function D3Tree() {
  const { layoutWidth, layoutHeight } = useSelector(state => state.d3tree);
  const [hierarchyData, setHierarchyData] = useState(hierarchy(mockTreeData));
  const fiberTree = new Node();

  const getTreeData = async () => {
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
    });

    if (svg.current.firstChild) svg.current.removeChild(svg.current.firstChild);
    svg.current.appendChild(chart);

    const modal = document.querySelector(".modal");
    const svgElement = document.querySelector(".svg svg");

    svgElement.addEventListener("mouseover", event => {
      const nodeData = hierarchyData.find(d => d.data.uuid === event.target.id);

      if (nodeData) {
        setNodeName(nodeData.data.name);
        if (typeof nodeData.data.name === "object") setNodeName("-");

        setNodeId(nodeData.data.uuid);
        setNodeProps(nodeData.data.props.join(",\n"));
        setNodeState(nodeData.data.state.join(",\n"));
      }
    });
    svgElement.addEventListener("mousemove", event => {
      const isMouseCloseToRight =
        window.innerWidth - event.clientX < modal.clientWidth + SIZE.PADDING;

      if (isMouseCloseToRight) {
        modal.style.left = `${event.clientX - 10 - modal.clientWidth}px`;
        modal.style.top = `${event.clientY - modal.clientHeight - 10}px`;
      } else {
        modal.style.left = `${event.clientX + 10}px`;
        modal.style.top = `${event.clientY - modal.clientHeight - 10}px`;
      }
    });
    svgElement.addEventListener("mouseout", () => {
      setNodeId(null);
      setNodeName(null);
      setNodeProps(null);
      setNodeState(null);
    });
  }, [hierarchyData, layoutWidth, layoutHeight]);

  return (
    <Wrapper>
      <div ref={svg} className="svg" />
      <div className="modal">
        <Modal nodeId={nodeId}>
          <div className="info-row">
            <span className="title">name : </span>
            <span className="description">{nodeName || "-"}</span>
          </div>
          <div className="info-row">
            <span className="title">props : </span>
            <pre className="description">{nodeProps || "-"}</pre>
          </div>
          <div className="info-row">
            <span className="title">state : </span>
            <pre className="description">{nodeState || "-"}</pre>
          </div>
        </Modal>
      </div>
    </Wrapper>
  );
}
