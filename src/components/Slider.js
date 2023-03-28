import { useSelector } from "react-redux";
import styled from "styled-components";
import { SIZE } from "../assets/constants";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  width: 50%;

  .sliderSection {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    width: 100%;

    .slider {
      display: flex;
      flex-direction: column;
      width: 20vw;

      .title {
        text-align: center;
      }
    }
  }

  .guideSection {
    padding: ${SIZE.PADDING}px;
    text-align: center;
    align-items: center;
  }
`;

export default function Slider() {
  const { directoryPath } = useSelector(state => state.path);

  return (
    <Wrapper>
      <div className="sliderSection">
        <div className="slider">
          <div className="title">WIDTH</div>
          <input
            id="sliderX"
            type="range"
            min="10"
            max="150"
            defaultValue={window.innerWidth / 4.5}
            name="width"
            aria-label="width"
          />
        </div>
        <div className="slider">
          <div className="title">HEIGHT</div>
          <input
            id="sliderY"
            type="range"
            min="10"
            max="100"
            name="height"
            aria-label="height"
          />
        </div>
      </div>
      {!directoryPath && (
        <div className="guideSection">
          폴더 경로를 선택하면 아래 예시와 같이 트리구조가 렌더링 됩니다.
        </div>
      )}
    </Wrapper>
  );
}
