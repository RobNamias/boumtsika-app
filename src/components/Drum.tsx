import styled from 'styled-components';
// import SliderVolumeComponent from './SliderVolumeComponent';

const StyledDrum = styled.div`
  width: 80px;
  height: 80px;
  // border-radius: 50%;
  background: darkslategrey;
  filter: drop-shadow(2px 2px 2px black);
  cursor: pointer;
  // border: 2px solid black;
  transition: all 0.1s;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  text-transform: capitalize;

  :active {
    background: darkgrey;
  }
    @media screen and (max-width: 1280px) {
    height : 50px;
    width: 50px;
    font-size: calc(5px + 2vh);
}
`;

type Props = {
  drumType: string;
  onClick: () => void;
};

const Drum: React.FC<Props> = ({ drumType, onClick }) => (
  <div className='drum_kit_line_src' id={'dkl_src' + { drumType }}>
    <StyledDrum onClick={onClick}>
      <p>{drumType}</p>
      {/* <SliderVolumeComponent volume={volume} /> */}
    </StyledDrum>
  </div>
);

export default Drum;