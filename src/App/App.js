import { useEffect, useState, useRef, useLayoutEffect } from "react";
import styled from "styled-components";

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
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  margin-bottom: ${size.padding};

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
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${colors.white};
  color: ${colors.button};
  border: 2px solid ${colors.button};
  border-radius: 10px;
  font-weight: 500;
  transition: 0.3s all ease;
  cursor: pointer;

  &:hover {
    background-color: ${colors.button};
    color: ${colors.white};
  }
`;

const Main = styled.main`
  height: 85%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: ${colors.background};

  .viewLayout {
    width: 100%;
    height: 100%;
    background-color: ${colors.view_background};
    color: white;
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
    height: 80%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    background-color: antiquewhite;
    border: 2px solid ${colors.border};
    border-radius: 10px;

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
  const [pathWidth, setPathWidth] = useState(150);
  const [pathHeight, setPathHeight] = useState(250);
  const [layout, setLayout] = useState({ width: 400, height: 850 });
  const ref = useRef(null);

  useEffect(() => {
    window.electronAPI.sendFilePath((event, path) => {
      setDirectoryPath(path);
      return path ? setHasPath(true) : null;
    });
  }, [directoryPath]);

  useLayoutEffect(() => {
    setLayout({
      width: ref.current.clientWidth,
      height: ref.current.clientHeight,
    });
  }, []);

  useEffect(() => {
    const handleWindow = () => {
      setLayout({
        width: ref.current.clientWidth,
        height: ref.current.clientHeight,
      });
    };

    window.addEventListener("resize", handleWindow);

    return () => window.addEventListener("resize", handleWindow);
  }, []);

  const handleSize = event => {
    if (event.target.name === "width") setPathWidth(event.target.value);
    if (event.target.name === "height") setPathHeight(event.target.value);
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
              min="0"
              max="300"
              name="width"
              value={pathWidth}
              onInput={handleSize}
            />
          </div>
          <div>
            <div className="title">Height</div>
            <input
              type="range"
              className="rangeBar"
              min="0"
              max="500"
              name="height"
              value={pathHeight}
              onInput={handleSize}
            />
          </div>
        </div>
        <div id="treeSection" className="viewLayout right" ref={ref}>
          <D3Tree
            pathWidth={pathWidth}
            pathHeight={pathHeight}
            layout={layout}
          />
        </div>
      </Main>
    </EntryWrapper>
  );
}

export default App;
