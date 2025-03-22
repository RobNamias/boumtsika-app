import styled from 'styled-components';

const StyledDrum = styled.div`
  width: 80px;
  height: 80px;
  // border-radius: 50%;
  background: darkslategrey;
  filter: drop-shadow(2px 2px 2px black);
  cursor: pointer;
  border: 5px solid black;
  transition: all 0.1s;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  text-transform: capitalize;

  :active {
    background: darkgrey;
    transform: scale(0.9);
  }

  @media (max-width: 700px) {
    width: 100px;
    height: 100px;
  }
`;

type Props = {
  drumType: string;
  onClick: () => void;
};

const Drum: React.FC<Props> = ({ drumType, onClick }) => (
  <StyledDrum onClick={onClick}>
    <p>{drumType}</p>
  </StyledDrum>
);

export default Drum;