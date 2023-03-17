/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import getTreeSVG from "../utils/getTreeSVG_vertical";
import Modal from "./Modal";
import treeData from "../assets/mock-treeData.json";

const Wrapper = styled.div`
  .modal {
    position: absolute;
  }
`;

export default function D3Tree() {
  const svg = useRef(null);
  const modalRef = useRef();
  const [nodeId, setNodeId] = useState("");

  useEffect(() => {
    const chart = getTreeSVG(treeData, {
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
        modal.style.top = `${e.clientY - modal.clientHeight - 10}px`;
        console.log("height...", modal.clientHeight);
      });
      node.addEventListener("mouseout", () => {
        setNodeId("");
      });
    });
  }, []);

  return (
    <Wrapper>
      <div ref={svg} />
      <div ref={modalRef} className="modal">
        <Modal nodeId={nodeId}>
          <div>name: {nodeId}</div>
          <div>props:</div>
          <div>state:</div>
        </Modal>
      </div>
    </Wrapper>
  );
}
