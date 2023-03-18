import styled from "styled-components";
import { useEffect, useState } from "react";
import D3Tree from "../components/D3tree";
import GlobalStyles from "../styles/GlobalStyles.styles";

import { colors, size } from "../assets/constants";

const EntryWrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: ${size.padding};
  background-color: ${colors.background};
  color: ${colors.button};
`;

const Header = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: ${size.margin};
  font-size: 40px;
`;

const Nav = styled.nav`
  margin-bottom: ${size.padding};
  display: flex;
  align-items: center;
  justify-content: space-evenly;

  > div {
    display: flex;
    flex-direction: column;
    align-items: center;

    > p {
      padding-bottom: ${size.padding};
    }
  }
`;

const Button = styled.button`
  min-width: 250px;
  height: 30px;
  color: ${colors.button};
  background: ${colors.white};
  border: 2px solid ${colors.button};
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.3s all ease;

  &:hover {
    background: ${colors.button};
    color: ${colors.white};
  }
`;

const Main = styled.main`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: ${colors.button};
  height: 85%;

  .viewLayout {
    background-color: aliceblue;
    width: 100%;
    color: white;
    height: 100%;
    border: 2px solid ${colors.border};
    border-radius: 10px;

    .left {
      margin-right: ${size.margin};
    }

    .right {
      margin-left: ${size.margin};
    }
  }

  .sideBar {
    width: 100px;
    background-color: antiquewhite;
    border: 2px solid ${colors.border};
    border-radius: 10px;
    height: 80%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;

    .rangeBar {
      appearance: slider-vertical;
    }

    .title {
      text-align: center;
    }
  }
`;

function App() {
  const [hasPath, setHasPath] = useState(false);
  const [directoryPath, setDirectoryPath] = useState("");
  const [width, setWidth] = useState(150);
  const [height, setHeight] = useState(250);

  useEffect(() => {
    window.electronAPI.sendFilePath((event, path) => {
      setDirectoryPath(path);
      return path ? setHasPath(true) : null;
    });
  }, [directoryPath]);

  const handleSize = event => {
    if (event.target.name === "width") setWidth(event.target.value);
    if (event.target.name === "height") setHeight(event.target.value);
  };

  return (
    <EntryWrapper>
      <GlobalStyles />
      <Header>
        <h1>Reactree</h1>
      </Header>
      <Nav>
        <div>
          <p>프로젝트의 폴더를 선택해주세요.</p>
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
        <div className="viewLayout left">렌더링 화면 구역</div>
        <div className="sideBar">
          <div>
            <div className="title">Width</div>
            <input
              type="range"
              className="rangeBar"
              min="100"
              max="300"
              name="width"
              value={width}
              onInput={handleSize}
            />
          </div>
          <div>
            <div className="title">Height</div>
            <input
              type="range"
              className="rangeBar"
              min="200"
              max="500"
              name="height"
              value={height}
              onInput={handleSize}
            />
          </div>
        </div>
        <div className="viewLayout right">
          <D3Tree width={width} height={height} />
        </div>
      </Main>
    </EntryWrapper>
  );
}

export default App;
