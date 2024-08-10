/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { StoredPath } from "contexts/Library";
import { Path } from "hooks/usePath";
import PathBubble from "./PathBubble";
import { useState, useRef, useEffect } from "react";
import { css, useTheme } from "@mui/material/styles";

type PathBubblesProps = {
  currentPath: Path | null;
  paths: StoredPath[];
  hoveredPathId: string | null;
  setHoveredPathId: (path: string | null) => void;
};

const EDGE_WIDTH = 30;
const WHEEL_SCROLL_FACTOR = 3;

const PathBubbles = ({ paths, currentPath, ...otherProps }: PathBubblesProps) => {
  const theme = useTheme();
  const darkTheme = theme.palette.mode === "dark";
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [scaleEdgeRight, setScaleEdgeRight] = useState(0);
  const [scaleEdgeLeft, setScaleEdgeLeft] = useState(0);

  const onScroll = () => {
    if (!scrollRef.current) return;
    const { scrollWidth, clientWidth, scrollLeft } = scrollRef.current;
    const hiddenWidthRight = scrollWidth - clientWidth - scrollLeft;
    setScaleEdgeRight(Math.min(hiddenWidthRight / EDGE_WIDTH, 1));
    setScaleEdgeLeft(Math.min(scrollLeft / EDGE_WIDTH, 1));
  };

  const onScrollWheel = (e: WheelEvent) => {
    const scrollElt = scrollRef.current;
    if (!scrollElt) return;
    scrollElt.scrollLeft += e.deltaY / WHEEL_SCROLL_FACTOR;
  };

  useEffect(() => {
    const scrollElt = scrollRef.current;
    if (!scrollElt) return;
    const observer = new ResizeObserver(onScroll);
    observer.observe(scrollElt);
    scrollElt.addEventListener("wheel", onScrollWheel);
    return () => {
      observer.disconnect();
      scrollElt.removeEventListener("wheel", onScrollWheel);
    };
  }, []);

  const currentPathIsStored = currentPath && paths.find(({ id }) => id === currentPath.id);

  useEffect(() => {
    if (!currentPath) return;
    // we auto scroll on the current path if present
    const pathBubble = document.getElementById(`path-${currentPath.id}`);
    if (!pathBubble) return;
    pathBubble.scrollIntoView();
  }, [currentPath, currentPathIsStored]);

  return (
    <Root
      css={css`
        --gradient-from: ${darkTheme ? "#1e1e1e00" : "#fff0"};
        --gradient-to: ${darkTheme ? "#1e1e1eff" : "#ffff"};
      `}
    >
      <ScrollablePart ref={scrollRef} onScroll={onScroll}>
        {paths.map((path) => (
          <BubbleWrapper key={path.id} id={`path-${path.id}`}>
            <PathBubble currentPath={currentPath} {...otherProps} path={path} />
          </BubbleWrapper>
        ))}
      </ScrollablePart>
      <EdgeRight
        css={css`
          transform: scaleX(${scaleEdgeRight});
        `}
      />
      <EdgeLeft
        css={css`
          transform: scaleX(${scaleEdgeLeft});
        `}
      />
    </Root>
  );
};

const Root = styled.div`
  flex: 1;
  position: relative;
  height: 100%;
`;

const ScrollablePart = styled.div`
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
  scrollbar-width: none;
`;

const Edge = styled.div`
  position: absolute;
  width: ${EDGE_WIDTH}px;
  top: 0;
  bottom: 0;
`;

const EdgeRight = styled(Edge)`
  right: 0;
  background: linear-gradient(90deg, var(--gradient-from) 0%, var(--gradient-to) 100%);
  transform-origin: right;
`;

const EdgeLeft = styled(Edge)`
  left: 0;
  background: linear-gradient(270deg, var(--gradient-from) 0%, var(--gradient-to) 100%);
  transform-origin: left;
`;

const BubbleWrapper = styled.div`
  &:not(:first-of-type) {
    margin-left: -10px;
  }
`;

export default PathBubbles;
