/* eslint-disable react/prop-types */
import CodeMirror from "@uiw/react-codemirror";
import styled from "styled-components";
import { javascript } from "@codemirror/lang-javascript";

const Wrapper = styled.div`
  max-height: 220px;
  max-width: 49vw;
  overflow: auto;
`;

export default function Codeviewer({ code }) {
  return (
    <Wrapper>
      <CodeMirror
        value={code}
        theme="dark"
        extensions={[javascript({ jsx: true })]}
        editable={false}
      />
    </Wrapper>
  );
}
