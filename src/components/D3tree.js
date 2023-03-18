/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
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
  const [treeData, setTreeData] = useState(mockTreeData);
  const fiberTree = new Node();

  const getTreeData = async function () {
    try {
      window.electronAPI.fiberData((event, value) => {
        createNode(value, fiberTree);
        setTreeData(fiberTree);
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getTreeData();
  }, []);

  const svg = useRef();
  const [nodeId, setNodeId] = useState("");

  useEffect(() => {
    const chart = getTreeSVG(treeData, {
      width: 800,
      height: 1000,
      label: d => d.name,
    });

    if (svg.current.firstChild) svg.current.removeChild(svg.current.firstChild);
    svg.current.appendChild(chart);

    const modal = document.querySelector(".modal");
    const componentNodes = document.querySelectorAll("svg circle");
    componentNodes.forEach(node => {
      node.addEventListener("mouseover", event => {
        setNodeId(event.target.id);
      });
      node.addEventListener("mousemove", event => {
        modal.style.left = `${event.clientX + 10}px`;
        modal.style.top = `${event.clientY - modal.clientHeight - 10}px`;
      });
      node.addEventListener("mouseout", () => {
        setNodeId("");
      });
    });
  }, [treeData]);

  return (
    <Wrapper>
      <div ref={svg} />
      <div className="modal">
        <Modal nodeId={nodeId}>
          <div>name: {nodeId}</div>
          <div>props:</div>
          <div>state:</div>
        </Modal>
      </div>
    </Wrapper>
  );
}
