/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import { useEffect, useRef } from "react";
import styled from "styled-components";
import getTreeSVG from "../utils/getTreeSVG_vertical";

const Wrapper = styled.div``;

export default function D3Tree() {
  const treeData = {
    name: "CompFirst",
    children: [
      {
        name: "CompSecret",
        children: [],
      },
      {
        name: "CompSecond",
        children: [
          {
            name: "CompThird",
            children: [],
          },
          {
            name: "CompThird",
            children: [],
          },
        ],
      },
    ],
  };

  const chart = getTreeSVG(treeData, {
    label: d => d.name,
    title: (d, n) =>
      `${n
        .ancestors()
        .reverse()
        .map(d => d.data.name)
        .join(".")}`, // hover text
    link: (d, n) => `https://www.google.com`,
  });

  const svg = useRef(null);

  useEffect(() => {
    if (svg.current) {
      svg.current.appendChild(chart);
    }
  }, [chart]);

  return (
    <Wrapper>
      <div ref={svg} />
    </Wrapper>
  );
}
