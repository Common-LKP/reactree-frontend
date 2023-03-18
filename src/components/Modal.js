/* eslint-disable react/prop-types */
import styled from "styled-components";

const Wrapper = styled.div`
  display: ${props => (props.nodeId ? "block" : "none")};
  width: 150px;
  padding: 3px;
  background-color: #ffffff;
`;

export default function Modal({ nodeId, children }) {
  return <Wrapper nodeId={nodeId}>{children}</Wrapper>;
}
