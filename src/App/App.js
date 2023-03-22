import { useEffect, useRef, useLayoutEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";

import { pathActions } from "../features/pathSlice";
import { d3treeActions } from "../features/d3treeSlice";
import D3Tree from "../components/D3tree";
import GlobalStyles from "../styles/GlobalStyles.styles";
import { COLORS, SIZE } from "../assets/constants";

const EntryWrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: ${SIZE.PADDING}px;
  background-color: ${COLORS.BACKGROUND};
  color: ${COLORS.BUTTON};
`;

const Header = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: ${SIZE.MARGIN}px;
  font-size: 40px;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${SIZE.PADDING}px;

  .buttonSection {
    width: 50%;
    display: flex;
    justify-content: space-evenly;

    .buttonBar {
      display: flex;
      flex-direction: column;
      align-items: center;

      > p {
        padding-bottom: ${SIZE.PADDING}px;
      }
    }
  }

  .sideBar {
    width: 50%;
    display: flex;
    justify-content: space-evenly;

    .title {
      text-align: center;
    }
  }
`;

const Button = styled.button`
  min-width: 250px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${COLORS.WHITE};
  color: ${COLORS.BUTTON};
  border: 2px solid ${COLORS.BUTTON};
  border-radius: 10px;
  font-weight: 500;
  transition: 0.3s all ease;

  :hover {
    cursor: pointer;
    background-color: ${COLORS.BUTTON};
    color: ${COLORS.WHITE};
  }
`;

const Main = styled.main`
  height: 85%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: ${COLORS.BACKGROUND};

  .viewLayout {
    width: 100%;
    height: 100%;
    background-color: ${COLORS.VIEW_BACKGROUND};
    color: white;
    border: 2px solid ${COLORS.BORDER};
    border-radius: 10px;
    margin: 1px;
  }
`;

function App() {
  const dispatch = useDispatch();
  const { hasPath, directoryPath } = useSelector(state => state.path);
  const { layoutWidth, layoutHeight } = useSelector(state => state.d3tree);
  const ref = useRef(null);
  let pathEllips = directoryPath || "폴더 선택";

  useEffect(() => {
    window.electronAPI.sendFilePath((event, path) => {
      dispatch(pathActions.setDirectoryPath({ path }));
      
      return path ? dispatch(pathActions.checkPath()) : null;
    });
  }, [directoryPath, dispatch]);

  useLayoutEffect(() => {
    dispatch(
      d3treeActions.setLayout({
        clientWidth: ref.current.clientWidth,
        clientHeight: ref.current.clientHeight,
      }),
    );
  }, [layoutWidth, layoutHeight, dispatch]);

  useEffect(() => {
    const handleWindow = () => {
      dispatch(
        d3treeActions.setLayout({
          clientWidth: ref.current.clientWidth,
          clientHeight: ref.current.clientHeight,
        }),
      );
    };

    window.addEventListener("resize", handleWindow);

    return () => window.addEventListener("resize", handleWindow);
  }, [layoutWidth, layoutHeight, dispatch]);

  if (directoryPath) {
    pathEllips =
      directoryPath.length > 29
        ? `...${directoryPath.slice(-29)}`
        : directoryPath;
  }

  return (
    <EntryWrapper>
      <GlobalStyles />
      <Header>
        <h1>Reactree</h1>
      </Header>
      <Nav>
        <div className="buttonSection">
          <div className="buttonBar">
            <p>프로젝트의 폴더를 선택해주세요.</p>
            <Button id="directoryButton">{pathEllips}</Button>
          </div>
          <div className="buttonBar">
            <p>시작 버튼을 눌러주세요.</p>
            <Button id="npmStartButton" type="text" disabled={!directoryPath}>
              npm start
            </Button>
          </div>
        </div>
        <div className="sideBar">
          <div>
            <div className="title">WIDTH</div>
            <input
              id="sliderX"
              type="range"
              className="rangeBar"
              min="10"
              max="600"
              name="width"
            />
          </div>
          <div>
            <div className="title">HEIGHT</div>
            <input
              id="sliderY"
              type="range"
              className="rangeBar"
              min="50"
              max="500"
              name="height"
            />
          </div>
        </div>
      </Nav>
      <Main>
        <div className="viewLayout render" />
        <div className="viewLayout tree" ref={ref}>
          <D3Tree />
        </div>
      </Main>
    </EntryWrapper>
  );
}

export default App;
