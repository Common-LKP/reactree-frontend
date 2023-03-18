/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import getTreeSVG from "../utils/getTreeSVG_vertical";
import Modal from "./Modal";

const Wrapper = styled.div`
  .modal {
    position: absolute;
  }
`;

export default function D3Tree() {
  const svg = useRef(null);
  const [nodeId, setNodeId] = useState("");
  const [nodeData, setNodeData] = useState(null);

  useEffect(() => {
    async function getNodeData() {
      await window.electronAPI.getTreeData((event, value) => {
        setNodeData(value);
      });
    }

    getNodeData();
  }, []);

  useEffect(() => {
    if (!nodeData) return;
    const chart = getTreeSVG(nodeData, {
      width: 800,
      height: 700,
      label: d => d.name,
    });

    svg.current.appendChild(chart);

    const modal = document.querySelector(".modal");
    const componentNodes = document.querySelectorAll("svg circle");
    componentNodes.forEach(node => {
      node.addEventListener("mouseover", e => {
        setNodeId(e.target.id);
      });
      node.addEventListener("mousemove", e => {
        modal.style.left = `${e.clientX + 10}px`;
        modal.style.top = `${e.clientY - 110}px`;
      });
      node.addEventListener("mouseout", () => {
        setNodeId("");
      });
    });
  }, [nodeData]);

  return (
    <Wrapper>
      <div ref={svg} />
      <div className="modal">
        <Modal nodeId={nodeId}>
          <div>name: {nodeId}</div>
        </Modal>
      </div>
    </Wrapper>
  );
}
