/* eslint-disable react/prop-types */
import styled from "styled-components";
import { COLORS, SIZE } from "../assets/constants";

const Wrapper = styled.div`
  display: ${props => (props.nodeId ? "block" : "none")};
  width: 180px;
  padding: ${SIZE.PADDING};
  background-color: ${COLORS.VIEW_BACKGROUND};
  color: ${COLORS.WHITE};
  border-radius: 4px;
  font-family: "Whitney", "Helvetica Neue";
  transition: all 0.3s ease;
`;

export default function Modal({ nodeId, children }) {
  return <Wrapper nodeId={nodeId}>{children}</Wrapper>;
}
