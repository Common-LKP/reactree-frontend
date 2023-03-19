import styled from "styled-components";
import { useEffect, useState } from "react";
import D3Tree from "../components/D3tree";
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

const Button = styled.button`
  min-width: 250px;
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
  const [hasPath, setHasPath] = useState(false);
  const [directoryPath, setDirectoryPath] = useState("");

  useEffect(() => {
    window.electronAPI.sendFilePath((event, path) => {
      setDirectoryPath(path);

      return path ? setHasPath(true) : null;
    });
  });

  return (
    <EntryWrapper>
      <GlobalStyles />
      <Header>
        <h1>Reactree</h1>
      </Header>
      <Nav>
        <div>
          <p>실행하고 싶은 프로젝트의 폴더를 선택해주세요.</p>
          <Button id="directoryButton">
            {hasPath ? directoryPath : "폴더 선택"}
          </Button>
        </div>
        <div>
          <p>npm 실행 명령어를 입력해주세요.</p>
          <Button
            id="npmStartButton"
            type="text"
            placeholder="ex) npm start"
            disabled={!hasPath}
          >
            npm start
          </Button>
        </div>
      </Nav>
      <Main>
        <div>렌더링 화면 구역</div>
        <D3Tree />
      </Main>
    </EntryWrapper>
  );
}

export default App;
