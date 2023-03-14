import React from "react";
import styled from "styled-components";
import GlobalStyles from "../styles/GlobalStyles.styles";

const EntryWrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: #1e2124;
  color: #7289da;
`;

const Header = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 16px;
  font-size: 40px;
`;

const Nav = styled.nav`
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  > div {
    width: 48%;
    display: flex;
    flex-direction: column;
    align-items: center;
    > p {
      margin-bottom: 8px;
    }
  }
`;

const Label = styled.label`
  width: 200px;
  height: 30px;
  color: #7289da;
  background: #ffffff;
  border: 2px solid #7289da;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.3s all ease;
  &:hover {
    background: #7289da;
    color: #ffffff;
  }
`;

const InputDirectory = styled.input`
  display: none;
`;

const InputCommand = styled.input`
  width: 250px;
  height: 30px;
  color: #7289da;
  background: #ffffff;
  border: 2px solid #7289da;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  text-align: center;
  ::placeholder {
    text-align: center;
  }
`;

const Main = styled.main`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  > div {
    width: 48%;
    height: calc(100vh - 200px);
    border: 3px solid #424549;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

function App() {
  return (
    <EntryWrapper>
      <GlobalStyles />
      <Header>
        <h1>Reactree</h1>
      </Header>
      <Nav>
        <div>
          <p>실행하고 싶은 프로젝트의 폴더를 선택해주세요.</p>
          <Label htmlFor="directory">
            <div>폴더 업로드하기</div>
          </Label>
          <InputDirectory type="file" webkitdirectory="" id="directory" />
        </div>
        <div>
          <p>npm 실행 명령어를 입력해주세요.</p>
          <InputCommand type="text" placeholder="ex) npm run start" />
        </div>
      </Nav>
      <Main>
        <div>렌더링 화면 구역</div>
        <div>트리 구조 구역</div>
      </Main>
    </EntryWrapper>
  );
}

export default App;
