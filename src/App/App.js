import { useEffect, useRef, useLayoutEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";

import { setLayout } from "../features/d3treeSlice";
import DirectorySelection from "../components/DirectorySelection";
import Slider from "../components/Slider";
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
`;

const Main = styled.main`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 85%;
  background-color: ${COLORS.BACKGROUND};

  .viewLayout {
    width: 100%;
    height: 100%;
    margin: 1px;
    background-color: ${COLORS.VIEW_BACKGROUND};
    border: 2px solid ${COLORS.BORDER};
    border-radius: 10px;
    color: white;
  }
`;

function App() {
  const dispatch = useDispatch();
  const { layoutWidth, layoutHeight } = useSelector(state => state.d3tree);
  const ref = useRef(null);

  useLayoutEffect(() => {
    dispatch(
      setLayout({
        clientWidth: ref.current.clientWidth,
        clientHeight: ref.current.clientHeight,
      }),
    );
  }, [layoutWidth, layoutHeight, dispatch]);

  useEffect(() => {
    const handleWindow = () => {
      dispatch(
        setLayout({
          clientWidth: ref.current.clientWidth,
          clientHeight: ref.current.clientHeight,
        }),
      );
    };

    window.addEventListener("resize", handleWindow);

    return () => window.addEventListener("resize", handleWindow);
  }, [layoutWidth, layoutHeight, dispatch]);

  return (
    <EntryWrapper>
      <GlobalStyles />
      <Header>
        <h1>Reactree</h1>
      </Header>
      <Nav>
        <DirectorySelection />
        <Slider />
      </Nav>
      <Main>
        <div className="viewLayout" />
        <div className="viewLayout" ref={ref}>
          <D3Tree />
        </div>
      </Main>
    </EntryWrapper>
  );
}

export default App;
