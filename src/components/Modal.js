/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable prettier/prettier */
import styled from "styled-components";
import PropTypes from "prop-types";

const Wrapper = styled.div`
  display: ${props => (props.nodeId ? "block" : "none")};
  width: 150px;
  padding: 3px;
  background-color: #ffffff;
`;

export default function Modal({ nodeId, children }) {
  return <Wrapper nodeId={nodeId}>{children}</Wrapper>;
}

Modal.propTypes = {
  nodeId: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
};
