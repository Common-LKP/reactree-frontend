/* eslint-disable no-shadow */
import React, { useEffect, useRef } from "react";
import getTreeSVG from "../utils/getTreeSVG_vertical";

export default function D3Tree() {
  const svg = useRef();
  const { ipcRenderer } = window.require("electron");

  ipcRenderer.on("get-path", (event, args) => {
    console.log("args", args);
  });

  useEffect(() => {
    const getTreeData = async function () {
      try {
        const data = await window.electronAPI.treeData();
        console.log("data...", data);

        const chart = getTreeSVG(data, {
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

        if (svg.current) {
          svg.current.appendChild(chart);
        }
      } catch (error) {
        console.error(error);
      }
    };

    getTreeData();
  }, []);

  return <div ref={svg} />;
}
