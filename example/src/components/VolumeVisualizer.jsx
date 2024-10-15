import { React, useState, useEffect } from 'react'
import { Container, Row, Col, ToggleButton, ToggleButtonGroup, Button } from 'react-bootstrap'
import { VolumeViewer, COLOR_MAPS, Blending } from 'react-volume-viewer'
import styled from "styled-components";
const colorMaps = [
  COLOR_MAPS.BlueScale,
  COLOR_MAPS.RedScale,
  COLOR_MAPS.Algae,
  COLOR_MAPS.Solar
]

export default function VolumeVisualizer () {
  const [controlsVisible, setControlsVisible] = useState(false)
  const [datasets, setDatasets] = useState([])
  const [selected, setSelected] = useState({
    // Initialize to an empty volume
    name: '',
    models: [],
    slices: 1,
    spacing: '0 0 0'
  })

  useEffect(() => {
    // npm run lint was failing without the reference to window object
    window
      .fetch('./data/data.json', {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      })
      .then((response) => response.json())
      .then((data) => {
        data.forEach(dataset => {
          dataset.models.forEach((model, modelIndex) => {
            model.colorMap = colorMaps[modelIndex]
            model.useColorMap = true
            model.useTransferFunction = true
          })
        })
        setDatasets(data)
        setSelected(data[0])
      })
  }, [])

  return (    
    <Container fluid className='px-5'>
    <Row className='mb-4'>
      <Col className='text-center'>
        <Button onClick={() => setControlsVisible(!controlsVisible)}>
          Options
        </Button>
      </Col>
      <Col className='text-center'>
        <ToggleButtonGroup
          name='datasetsButtonGroup'
          type='radio'
          value={selected}
          onChange={selection => setSelected(selection)}
        >
          {datasets.map(dataset => (
            <ToggleButton key={dataset.name} value={dataset}>
              {dataset.name}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Col>
    </Row>
    <Row>
      <StyledVolumeViewer
        className='volumeViewer'
        blending={Blending.Max}
        controlsVisible={controlsVisible}
        models={selected.models}
        slices={selected.slices}
        spacing={selected.spacing}
      />
    </Row>
  </Container>
  )
}
const StyledVolumeViewer = styled(VolumeViewer)`
  height: 85vh;
`;