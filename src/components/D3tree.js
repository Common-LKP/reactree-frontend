/* eslint-disable no-shadow */
import React, { useEffect, useRef, useState } from "react";
import getTreeSVG from "../utils/getTreeSVG";

export default function D3Tree() {
  const [treeData, setTreeData] = useState();

  useEffect(() => {
    const getTreeData = async function () {
      try {
        const data = await window.TreeAPI.treeData();
        setTreeData(data);
      } catch (error) {
        console.error(error);
      }
    };

    getTreeData();
  }, []);

  const chart = getTreeSVG(treeData, {
    label: d => d.name,
    title: (d, n) =>
      `${n
        .ancestors()
        .reverse()
        .map(d => d.data.name)
        .join(".")}`, // hover text
    link: `https://www.google.com`,
    width: 600,
  });

  const svg = useRef(null);

  useEffect(() => {
    if (svg.current) {
      svg.current.appendChild(chart);
    }
  }, [chart]);

  return <div ref={svg} />;
}
