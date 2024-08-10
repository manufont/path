/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import Divider from "@mui/material/Divider";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import { ClassNames } from "@emotion/react";
import { Path } from "hooks/usePath";
import Card from "@mui/material/Card";
import { useContext, useState } from "react";
import { LibraryContext } from "contexts";
import { IconButton, Typography } from "@mui/material";
import PathBubbles from "./PathBubbles";
import PathBubble from "./PathBubble";
import PathList from "./PathList";

type LibraryProps = {
  path: Path | null;
  showLibrary: boolean;
  setShowLibrary: (showLibrary: boolean) => void;
};

const Library = ({ showLibrary, setShowLibrary, path }: LibraryProps) => {
  const { loading, storedPaths, addPath } = useContext(LibraryContext);

  const [hoveredPathId, setHoveredPathId] = useState<string | null>(null);

  const isCurrentPathSaved = Boolean(storedPaths.find((storedPath) => storedPath.id === path?.id));

  if (loading) return null;

  return (
    <ExpandableCard>
      <ClassNames>
        {({ css }) => (
          <Accordion expanded={showLibrary} onChange={undefined}>
            <AccordionSummary
              classes={{
                content: css`
                  margin: 6px 0;
                  min-width: 0;
                `,
                expanded: css`
                  margin-top: 0 !important;
                  margin-bottom: 0 !important;
                `,
                gutters: css`
                  padding: 0 8px;
                `,
              }}
            >
              <SummaryDiv>
                {storedPaths.length === 0 ? (
                  <Typography>No saved path yet</Typography>
                ) : (
                  <>
                    <PathBubbles
                      paths={storedPaths}
                      currentPath={path}
                      hoveredPathId={hoveredPathId}
                      setHoveredPathId={setHoveredPathId}
                    />
                  </>
                )}
                {path && !isCurrentPathSaved && (
                  <PathBubble
                    path={path}
                    showAddButton
                    onClick={(e) => {
                      e.stopPropagation();
                      addPath(path);
                    }}
                    hoveredPathId={hoveredPathId}
                    setHoveredPathId={setHoveredPathId}
                  />
                )}

                {storedPaths.length > 0 && (
                  <ExpandButton onClick={() => setShowLibrary(!showLibrary)}>
                    <ExpandLessIcon
                      css={css`
                        transform: rotate(${showLibrary ? 0 : 180}deg);
                      `}
                    />
                  </ExpandButton>
                )}
              </SummaryDiv>
            </AccordionSummary>
            <StyledAccordionDetails>
              <Divider />
              {storedPaths.length > 0 && (
                <PathList
                  paths={storedPaths}
                  currentPath={path}
                  hoveredPathId={hoveredPathId}
                  setHoveredPathId={setHoveredPathId}
                />
              )}
            </StyledAccordionDetails>
          </Accordion>
        )}
      </ClassNames>
    </ExpandableCard>
  );
};
export default Library;

const SummaryDiv = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
  min-width: 0;
`;

const StyledAccordionDetails = styled(AccordionDetails)`
  flex-direction: column;
  padding: 0;
`;

const ExpandableCard = styled(Card)`
  margin-top: 16px;
  overflow: visible;

  @media screen and (max-width: 640px) {
    bottom: 0;
    margin-top: -6px;
  }
`;

const ExpandButton = styled(IconButton)`
  transition: transform 0.3s ease;
  margin-right: -8px;
`;
