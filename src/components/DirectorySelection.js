import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import styled from "styled-components";
import { setDirectoryPath } from "../features/pathSlice";
import { SIZE, COLORS } from "../assets/constants";

const ButtonSection = styled.div`
  display: flex;
  justify-content: space-evenly;
  width: 50%;

  .button {
    display: flex;
    flex-direction: column;
    align-items: center;

    > p {
      padding-bottom: ${SIZE.PADDING}px;
    }
  }
`;

const Button = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 250px;
  height: 30px;
  background-color: ${COLORS.WHITE};
  border: 2px solid ${COLORS.BUTTON};
  border-radius: 10px;
  color: ${COLORS.BUTTON};
  font-weight: 500;
  transition: 0.3s all ease;

  :hover {
    cursor: pointer;
    background-color: ${COLORS.BUTTON};
    color: ${COLORS.WHITE};
  }
`;

export default function DirectorySelection() {
  const dispatch = useDispatch();
  const { directoryPath } = useSelector(state => state.path);
  let pathEllips = directoryPath || "폴더 선택";

  if (directoryPath) {
    pathEllips =
      directoryPath.length > 50
        ? `...${directoryPath.slice(-50)}`
        : directoryPath;
  }

  useEffect(() => {
    window.electronAPI.sendFilePath((event, path) => {
      dispatch(setDirectoryPath({ path }));
    });
  }, [directoryPath, dispatch]);

  return (
    <ButtonSection>
      <div className="button">
        <p>프로젝트의 폴더를 선택해주세요.</p>
        <Button id="directoryButton" data-testid="path">
          {pathEllips}
        </Button>
      </div>
    </ButtonSection>
  );
}
