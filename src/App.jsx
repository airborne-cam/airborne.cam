import React, { useState } from "react";
import "./styles.css";

import makeStyles from "@material-ui/core/styles/makeStyles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import {
  TextField,
  Button,
  Paper,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from "@material-ui/core";
import Chart from "./Chart";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import Tooltip from "@material-ui/core/Tooltip";

import Switch from "@material-ui/core/Switch";

import Collapse from "@material-ui/core/Collapse";
import useScrollTrigger from "@material-ui/core/useScrollTrigger";

import { roomCalculation } from "./calc";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
      // width: "100%",
      alignItems: "center",
      justifyContent: "center"
    }
  },
  buttonContainer: {
    "& > *": {
      margin: theme.spacing(1)
    }
  },
  papermiddle: {
    padding: "10px",
    textAlign: "center"
    // color: theme.palette.text.secondary,
  },
  containertop: {
    height: "100%",
    paddingTop: "0px",
    paddingLeft: "20px",
    textAlign: "right",
    backgroundColor: "#f2f2f2"
  },
  containermiddle: {},
  containerbottom: {
    display: "flex",
    backgroundColor: "#f2f2f2",
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center"
  },
  boxbottom: {
    maxWidth: "700px",
    padding: "20px"
  },
  containerfooter: {
    display: "flex",
    padding: "20px"
    // width: "100%",
  }
}));

export default function App() {
  const [Ar, setAr] = useState(100);
  const [Hr, setHr] = useState(3);
  const [maskType, setMaskType] = useState(0);
  const [activityType, setActivityType] = useState(1);
  const [maskTypeSick, setMaskTypeSick] = useState(0);
  const [activityTypeSick, setActivityTypeSick] = useState(1);
  const [cutoffType, setcutoffType] = useState(2);
  const [verticalvType, setverticalvType] = useState(0);
  const [sACHType, setsACHType] = useState(1);
  const [ACHcustom, setACHcustom] = useState(1);
  const [sFilterType, setsFilterType] = useState(0);
  const [outsideAir, setOutsideAir] = useState(100);

  const [nInf, setNInf] = useState(10);
  const [nInfmin, setNInfmin] = useState(1);
  const [nPeople, setNPeople] = useState(20);
  const [EH, setEH] = useState(0);
  const [occupancyType, setOccupancyType] = useState(0);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [infChecked, setInfChecked] = useState(false);

  // Time/duration variables
  const [custombreakDate, setCustomBreakTime] = useState("12:30");
  const [t_customBreak, setCustomBreakDuration] = useState(0);
  const [startDate, setStartTime] = useState("09:00");
  const [endDate, setEndTime] = useState("17:00");

  const [open, setOpen] = React.useState(false);

  const handleContactUs = () => {
    window.location.href = `mailto:contact@airborne.cam`;
    handleClose();
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const toggleInfChecked = () => {
    setInfChecked((prev) => !prev);
  };

  const classes = useStyles();

  // Collapse and sticky of the top
  const mobileBreakpoint = useMediaQuery("(max-width: 1024px)");
  const triggerScroll = useScrollTrigger({
    disableHysteresis: true,
    threshold: 1
  });
  const stickyCollapse = () => {
    const value = mobileBreakpoint * triggerScroll ? false : true; //replace checked with variable for scroll
    return value;
  };

  // Advanced mode button
  const handleAdvancedMode = () => {
    setAdvancedMode(!advancedMode);
  };

  // Data to display in apex charts
  const chartData = (Vli = 8) => {
    const {
      C,
      R,
      XCO2,
      peopleOverTime,
      infectedPeopleOverTime,
      timeSeries,
      Vperson
    } = roomCalculation(
      Ar,
      Hr,
      sACHType,
      nInf,
      nInfmin,
      nPeople,
      EH,
      Vli,
      maskType,
      activityType,
      maskTypeSick,
      activityTypeSick,
      cutoffType,
      verticalvType,
      occupancyType,
      custombreakDate,
      t_customBreak,
      startDate,
      endDate,
      ACHcustom,
      sFilterType,
      outsideAir,
      infChecked
    );

    const riskData = timeSeries.map((time, i) => [time / 3600, R[i] * 100]);
    const concentrationData = timeSeries.map((time, i) => [time / 3600, C[i]]);
    const co2Data = timeSeries.map((time, i) => [time / 3600, XCO2[i]]);
    const peopleData = timeSeries.map((time, i) => [
      time / 3600,
      peopleOverTime[i]
    ]);
    const infectedData = timeSeries.map((time, i) => [
      time / 3600,
      infectedPeopleOverTime[i]
    ]);
    return {
      riskData,
      concentrationData,
      co2Data,
      peopleData,
      infectedData,
      Vperson
    };
  };

  const data = {
    Vl1: chartData(),
    Vl2: chartData(9),
    Vl3: chartData(10)
  };

  const occupationSeries = [
    {
      name: "susceptible",
      data: data.Vl1.peopleData
    },
    {
      name: "infectious",
      data: data.Vl1.infectedData
    }
  ];

  const riskSeries = [
    {
      name: "Vl=10^9",
      data: data.Vl2.riskData
    },
    {
      name: "Vl=10^8",
      data: data.Vl1.riskData
    },
    {
      name: "Vl=10^10 copies/ml",
      data: data.Vl3.riskData
    }
  ];

  const concentrationSeries = [
    {
      name: "Vl=10^9",
      data: data.Vl2.concentrationData
    },
    {
      name: "Vl=10^8",
      data: data.Vl1.concentrationData
    },
    {
      name: "Vl=10^10 copies/ml",
      data: data.Vl3.concentrationData
    }
  ];

  const concentrationSeriesBASIC = [
    {
      name: "Vl=10^9 copies/ml",
      data: data.Vl2.concentrationData
    }
  ];

  const riskSeriesBASIC = [
    {
      name: "Vl=10^9 copies/ml",
      data: data.Vl2.riskData
    }
  ];

  const CO2Series = [
    {
      name: "CO2",
      data: data.Vl1.co2Data
    }
  ];

  return (
    <div className="App">
      {/* Top Row */}
      <div className={stickyCollapse() ? "nonsticky" : "sticky"}>
        <Box boxShadow={stickyCollapse() ? 0 : 10}>
          <Grid container spacing={0}>
            {/* Airborne.cam */}
            <Grid item xs={12} md={6}>
              <Container className={classes.containertop}>
                <Collapse
                  in={stickyCollapse()}
                  timeout={{ appear: 1000, enter: 300, exit: 300 }}
                >
                  <div>
                    <h2>Airborne.cam</h2>
                    <p className="Spacer">
                      This app helps users understand how mitigation measures
                      affect the indoors transmission of the SARS-CoV-2 virus.
                      The estimated risk percentage should be treated with great
                      caution! Many of the model inputs are very uncertain.
                      Thus, the user should see how risk of infection decreases
                      or increases by using face masks, by improving
                      ventilation, etc. It is assumed that hands are washed and
                      that individuals are far apart from each other — that is,
                      the risk of short-range transmission by droplets/aerosol
                      is not included and might be significant.{" "}
                      <i>
                        {" "}
                        By using the Airborne.cam, you agree to be bound by the
                        terms of use and disclaimer below.
                      </i>
                      .
                    </p>
                    <div className={classes.buttonContainer}>
                      <Button
                        variant="contained"
                        color="default"
                        target="_blank"
                        href="/airbornedotcam.pdf"
                      >
                        Learn More
                      </Button>
                      <Button
                        variant="contained"
                        color={advancedMode ? "secondary" : "default"}
                        onClick={handleAdvancedMode}
                      >
                        Advanced mode {advancedMode ? "ON" : ""}
                      </Button>
                    </div>
                  </div>
                </Collapse>
              </Container>
            </Grid>

            {/* Infection risk plot */}
            <Grid item xs={12} md={6}>
              <Container className={classes.containertop}>
                <Chart
                  title=""
                  yAxisLabel="INDIVIDUAL RISK OF INFECTION (%)"
                  xAxisLabel="time (h)"
                  series={advancedMode ? riskSeries : riskSeriesBASIC}
                />
              </Container>
            </Grid>
          </Grid>
        </Box>
      </div>

      {/* Mid Row */}
      <div
        className={stickyCollapse() ? "nonsticky-middle" : "sticky-wrapper2"}
      >
        <div className={classes.containermiddle}>
          <Grid container spacing={2}>
            {/* Room Settings */}
            <Grid item xs={12} lg={3} sm={6}>
              <Paper className={classes.papermiddle}>
                <form className={classes.root} noValidate autoComplete="off">
                  <h4>
                    Room
                    <Tooltip title="Set the floor area and ceiling height of the room.">
                      <HelpOutlineIcon
                        style={{ color: "gray" }}
                        fontSize="small"
                      />
                    </Tooltip>
                  </h4>

                  <div className={classes.root}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <FormControl>
                          <TextField
                            value={Ar}
                            onChange={(event) => setAr(event.target.value)}
                            label="Floor area (m^2)"
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl>
                          <TextField
                            value={Hr}
                            onChange={(event) => setHr(event.target.value)}
                            label="Ceiling height (m)"
                          />
                        </FormControl>
                      </Grid>
                    </Grid>
                  </div>
                  <h4 className="Spacer">
                    Period
                    <Tooltip
                      title="Set the start and end times for the analysis.                  
                     The start time must be the time which the room
                    is first open (i.e. the room is clean before this time)."
                    >
                      <HelpOutlineIcon
                        style={{ color: "gray" }}
                        fontSize="small"
                      />
                    </Tooltip>
                  </h4>
                  <div className={classes.root}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <FormControl>
                          <TextField
                            id="timeFrom"
                            label="from"
                            type="time"
                            defaultValue="09:00"
                            // value = {startDate}
                            onChange={(event) =>
                              setStartTime(event.target.value)
                            }
                            InputLabelProps={{
                              shrink: true
                            }}
                            inputProps={{
                              step: 300 // 5 min
                            }}
                          />
                        </FormControl>
                      </Grid>

                      <Grid item xs={6}>
                        <FormControl>
                          <TextField
                            id="timeTo"
                            label="to"
                            type="time"
                            defaultValue="17:00"
                            onChange={(event) => setEndTime(event.target.value)}
                            InputLabelProps={{
                              shrink: true
                            }}
                            inputProps={{
                              step: 300 // 5 min
                            }}
                          />
                        </FormControl>
                      </Grid>
                    </Grid>
                  </div>
                  <h4 className="Spacer">
                    Ventilation
                    <Tooltip
                      title="Set the ventilation flow rate of your room in air changes per hour.
                    Typical values are given in the drop-down menu for various indoors spaces (office buildings, hospitals, etc.), please pick the one closest to your room in terms of ACH or function or select the custom option to add any numerical value.
                    Engineers recommend ventilation rates in terms of fresh air flow rate per occupant in the room,
                    typically 5-10 litres/second/person for schools and offices, depending on the maximum
                    density of the room (person/area). For your guidance you can see the calculated lts/s/person based
                    on the ACH you selected and the number of occupants you entered."
                    >
                      <HelpOutlineIcon
                        style={{ color: "gray" }}
                        fontSize="small"
                      />
                    </Tooltip>
                  </h4>

                  <div className={classes.root}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <FormControl>
                          <InputLabel id="selectACH">(ACH)</InputLabel>
                          <Select
                            labelId="selectACH"
                            value={sACHType}
                            onChange={(event) =>
                              setsACHType(event.target.value)
                            }
                            InputLabelProps={{
                              shrink: true,
                              fullWidth: true
                            }}
                          >
                            <MenuItem value={0}>0.3 poorly ventilated</MenuItem>
                            <MenuItem value={1}>1 domestic </MenuItem>
                            <MenuItem value={2}>3 offices/schools</MenuItem>
                            <MenuItem value={3}>5 well ventilated</MenuItem>
                            <MenuItem value={4}>10 typical maximum</MenuItem>
                            <MenuItem value={5}>20 hospital setting</MenuItem>
                            <MenuItem value={6}>custom value</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={3}>
                        {sACHType == 6 ? (
                          <>
                            <FormControl>
                              <TextField
                                value={ACHcustom}
                                onChange={(event) =>
                                  setACHcustom(event.target.value)
                                }
                                label="(ACH)"
                              />
                            </FormControl>
                          </>
                        ) : (
                          ""
                        )}
                      </Grid>
                      <Grid item xs={3}>
                        <FormControl>
                          <TextField
                            readOnly
                            value={data.Vl1.Vperson}
                            label="(l/s/person)"
                          />
                        </FormControl>
                      </Grid>
                    </Grid>
                  </div>
                  {advancedMode ? (
                    <>
                      <div className={classes.root}>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <FormControl>
                              <TextField
                                value={outsideAir}
                                onChange={(event) =>
                                  setOutsideAir(event.target.value)
                                }
                                label="Outside air (% of ACH)"
                              />
                            </FormControl>
                          </Grid>
                          <Grid item xs={6}>
                            <FormControl>
                              <InputLabel id="selectFilter">Filter</InputLabel>
                              <Select
                                labelId="selectFilter"
                                value={sFilterType}
                                onChange={(event) =>
                                  setsFilterType(event.target.value)
                                }
                                InputLabelProps={{
                                  shrink: true,
                                  fullWidth: true
                                }}
                              >
                                <MenuItem value={0}>none</MenuItem>
                                <MenuItem value={1}>HEPA</MenuItem>
                                <MenuItem value={2}>ePM1 (90%)</MenuItem>
                                <MenuItem value={3}>ePM2.5 (90%)</MenuItem>
                                <MenuItem value={4}>ePM10 (90%)</MenuItem>
                                <MenuItem value={5}>ISO coarse</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={6}>
                            <FormControl>
                              <InputLabel id="cutoff">
                                Aerosol cut-off
                              </InputLabel>
                              <Select
                                labelId="cutoff"
                                value={cutoffType}
                                onChange={(event) =>
                                  setcutoffType(event.target.value)
                                }
                              >
                                <MenuItem value={0}>5 μm </MenuItem>
                                <MenuItem value={1}>10 μm</MenuItem>
                                <MenuItem value={2}>20 μm</MenuItem>
                                <MenuItem value={3}>40 μm</MenuItem>
                                <MenuItem value={4}>100 μm</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={6}>
                            <FormControl>
                              <InputLabel id="vvel">
                                Air vertical velocity
                              </InputLabel>
                              <Select
                                labelId="vvel"
                                value={verticalvType}
                                onChange={(event) =>
                                  setverticalvType(event.target.value)
                                }
                              >
                                <MenuItem value={0}>negligible ~0 m/s</MenuItem>
                                <MenuItem value={1}>low ~0.1 m/s</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                      </div>
                    </>
                  ) : (
                    ""
                  )}
                  <div className="CWidth"></div>
                </form>
              </Paper>
            </Grid>

            {/* Occupancy */}
            <Grid item xs={12} lg={3} sm={6}>
              <Paper className={classes.papermiddle}>
                <form className={classes.root} noValidate autoComplete="off">
                  <h4>
                    Occupancy
                    <Tooltip
                      title="Set the maximum number of occupants in the room, their activity, and if they
                    are wearing a mask. Advanced Mode allows for a room with
                    varying occupancy."
                    >
                      <HelpOutlineIcon
                        style={{ color: "gray" }}
                        fontSize="small"
                      />
                    </Tooltip>
                  </h4>
                  <div className={classes.root}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <FormControl>
                          <TextField
                            value={nPeople}
                            onChange={(event) => setNPeople(event.target.value)}
                            label="Max occupancy (#)"
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl>
                          <InputLabel id="mask">Mask type</InputLabel>
                          <Select
                            labelId="mask"
                            value={maskType}
                            onChange={(event) =>
                              setMaskType(event.target.value)
                            }
                          >
                            <MenuItem value={0}>no mask</MenuItem>
                            <MenuItem value={1}>FFP2/N95</MenuItem>
                            <MenuItem value={2}>surgical</MenuItem>
                            <MenuItem value={3}>3-ply cloth</MenuItem>
                            <MenuItem value={4}>1-ply cloth</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={6}>
                        <FormControl>
                          <InputLabel id="activity">Activity</InputLabel>
                          <Select
                            labelId="activity"
                            value={activityType}
                            onChange={(event) =>
                              setActivityType(event.target.value)
                            }
                          >
                            {/*<MenuItem value={0}>sitting breathing</MenuItem>
                          <MenuItem value={1}>standing speaking</MenuItem>
                          <MenuItem value={2}>speaking loudly</MenuItem>
                          <MenuItem value={3}>heavy activity</MenuItem>
                          */}
                            <MenuItem value={0}>sitting/breathing</MenuItem>
                            <MenuItem value={1}>standing/exercise</MenuItem>
                            <MenuItem value={2}>heavy exercise</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        {advancedMode ? (
                          <>
                            <FormControl>
                              <InputLabel id="occupancyType">Type</InputLabel>
                              <Select
                                labelId="occupancyType"
                                value={occupancyType}
                                onChange={(event) =>
                                  setOccupancyType(event.target.value)
                                }
                              >
                                <MenuItem value={0}>constant</MenuItem>
                                <MenuItem value={1}>gaussian</MenuItem>
                              </Select>
                            </FormControl>
                          </>
                        ) : (
                          ""
                        )}
                      </Grid>
                    </Grid>
                  </div>
                </form>
                {advancedMode ? (
                  <div className="CWidth">
                    <Chart
                      series={occupationSeries}
                      title=""
                      yAxisLabel="people in the room (#)"
                      xAxisLabel="time (h)"
                      opposite="true"
                    />
                  </div>
                ) : (
                  ""
                )}
              </Paper>
            </Grid>

            {/* CO2 Break */}
            <Grid item xs={12} lg={3} sm={6}>
              <Paper className={classes.papermiddle}>
                <form className={classes.root} noValidate autoComplete="off">
                  <h4>
                    Custom break
                    <Tooltip
                      title="To keep risk low, empty-room breaks can be taken throughout
                  the day where all occupants leave the room. This way, ventilation systems
                  can clean the air while there are no infectious individuals in the room.
                  Here, set the time and duration of a break (0 for no break). The
                  Advanced Mode shows the CO2 concentration and allows for a
                  uniform-break, time-tabling system."
                    >
                      <HelpOutlineIcon
                        style={{ color: "gray" }}
                        fontSize="small"
                      />
                    </Tooltip>
                  </h4>
                  <div className={classes.root}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <FormControl>
                          <TextField
                            id="time"
                            label="Start"
                            type="time"
                            defaultValue="12:30"
                            onChange={(event) =>
                              setCustomBreakTime(event.target.value)
                            }
                            InputLabelProps={{
                              shrink: true
                            }}
                            inputProps={{
                              step: 300 // 5 min
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl>
                          <TextField
                            value={t_customBreak}
                            onChange={(event) =>
                              setCustomBreakDuration(event.target.value)
                            }
                            label="Duration (min)"
                          />
                        </FormControl>
                      </Grid>
                    </Grid>
                  </div>
                  {advancedMode ? (
                    <>
                      <h4>Regular breaks</h4>
                      <FormControl>
                        <TextField
                          value={EH}
                          onChange={(event) => setEH(event.target.value)}
                          label="Uniform breaks (#/h)"
                        />
                      </FormControl>
                    </>
                  ) : (
                    ""
                  )}
                </form>
                <h4>
                  CO2 concentration
                  <Tooltip
                    title="This graph shows the CO2 concentration over time based on typical exhalation rates, the number of occupants, and the room ventilation rate. CO2  concentration can be used (and measured!) to keep risk
                      low. Modern ventilation systems may monitor CO2 levels to control the
                      amount of outside air into the room. Levels below 1000 ppm
                      suggest ventilation is adequate for indoor spaces like schools or offices. Higher
                      ventilation rates may be needed for more intense
                      activities other than desk-based work."
                  >
                    <HelpOutlineIcon
                      style={{ color: "gray" }}
                      fontSize="small"
                    />
                  </Tooltip>
                </h4>
                <div className="CWidth">
                  <Chart
                    series={CO2Series}
                    title=""
                    yAxisLabel="CO2 (ppm)"
                    xAxisLabel="time (h)"
                    offsetX="-100px"
                  />
                </div>
              </Paper>
            </Grid>

            {/* Virus */}
            <Grid item xs={12} lg={3} sm={6}>
              <Paper className={classes.papermiddle}>
                <form className={classes.root} noValidate autoComplete="off">
                  <h4>
                    Infectious individuals
                    <Tooltip
                      title="Select between a constant number of infectious individuals
                      or a relative value based on the total number of occupants at a given time.
                     The relative value is useful in the Advanced Mode, where varying occupancy can
                     be set. The Advanced Mode allows for other viral loads (virus concentration in the saliva)
                     to be set in addition to the value of 10^9 copies/ml used in the Basic Mode."
                    >
                      <HelpOutlineIcon
                        style={{ color: "gray" }}
                        fontSize="small"
                      />
                    </Tooltip>
                  </h4>
                  <div className={classes.root}>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <FormControl>
                          <TextField
                            value={nInfmin}
                            onChange={(event) => setNInfmin(event.target.value)}
                            label="Constant infectious (#)"
                            disabled={infChecked}
                          />
                        </FormControl>
                      </Grid>

                      <Grid item xs={3}>
                        {/* <FormGroup> */}
                        {/* <FormControlLabel
                            control={ */}
                        <Switch
                          checked={infChecked}
                          onChange={toggleInfChecked}
                          color="default"
                        />
                        {/* }
                           label=""
                          /> */}
                        {/* </FormGroup> */}
                      </Grid>

                      <Grid item xs={4}>
                        <FormControl>
                          <TextField
                            value={nInf}
                            onChange={(event) => setNInf(event.target.value)}
                            label="Percent infectious (%)"
                            disabled={infChecked ? false : true}
                          />
                        </FormControl>
                      </Grid>

                      <Grid item xs={6}>
                        <FormControl>
                          <InputLabel id="maskSick">Mask type</InputLabel>
                          <Select
                            labelId="maskSick"
                            value={maskTypeSick}
                            onChange={(event) =>
                              setMaskTypeSick(event.target.value)
                            }
                          >
                            <MenuItem value={0}>no mask</MenuItem>
                            <MenuItem value={1}>FFP2/N95</MenuItem>
                            <MenuItem value={2}>surgical</MenuItem>
                            <MenuItem value={3}>3-ply cloth</MenuItem>
                            <MenuItem value={4}>1-ply cloth</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl>
                          <InputLabel id="activity">Activity</InputLabel>
                          <Select
                            labelId="activity"
                            value={activityTypeSick}
                            onChange={(event) =>
                              setActivityTypeSick(event.target.value)
                            }
                          >
                            <MenuItem value={0}>sitting speaking</MenuItem>
                            <MenuItem value={1}>standing/exercise</MenuItem>
                            <MenuItem value={2}>heavy exercise</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </div>
                </form>

                <div className="CWidth">
                  <Chart
                    series={
                      advancedMode
                        ? concentrationSeries
                        : concentrationSeriesBASIC
                    }
                    title=""
                    yAxisLabel="virus in the air (PFU/m^3)"
                    xAxisLabel="time (h)"
                  />
                </div>
                <div>
                  {advancedMode ? (
                    <>
                      <Tooltip
                        title="Viral load is the concentration of virus in the saliva of
                        infected individuals, both symptomatic and asymptomatic. This value varies significantly over the
                        duration of the disease. The default value used (10^9 copies/ml) refers to 
                        the most infectious phase. The Advanced Mode, can be used to set higher or lower values."
                      >
                        <HelpOutlineIcon
                          style={{ color: "gray" }}
                          fontSize="small"
                        />
                      </Tooltip>
                    </>
                  ) : (
                    ""
                  )}
                </div>
              </Paper>
            </Grid>
          </Grid>
        </div>

        {/* Footer Rows */}
        <div className={classes.containerbottom}>
          <Box className={classes.boxbottom}>
            <span className="Spacer">
              The information provided on the Airborne.cam website, including
              the output of the Airborne.cam app, is of an experimental nature
              and is provided for information only. No warranty is given
              regarding its accuracy or completeness. It does not constitute,
              and should not be used a substitute for, professional advice,
              which should be sought for any practical applications. Use of the
              Airborne.cam app is entirely at the user’s risk. To the fullest
              extent permitted by law, the University of Cambridge and the
              authors of the Airborne.cam website and app shall have no
              liability for any loss or damage suffered as a result of users’
              use of or reliance on Airborne.cam.
            </span>

            <p className="Spacer">
              In an effort to keep this app relevant to address the COVID-19
              pandemic, the calculation method will be constantly updated to
              keep up with the latest scientific findings. To know more, please
              regularly check{" "}
              <a href="/airbornedotcam.pdf" rel="noreferrer" target="_blank">
                this document
              </a>
              . If you would like to collaborate with us, do get in touch!
            </p>
            <div className="Spacer">
              <div className={classes.buttonContainer}>
                <Button
                  variant="contained"
                  color="default"
                  target="_blank"
                  onClick={handleClickOpen}
                >
                  {" "}
                  About us{" "}
                </Button>
              </div>
            </div>
          </Box>
        </div>

        <div className={classes.containerfooter}>
          <Grid container spacing={0}>
            <Grid item xs={12} sm={4}>
              <h3>
                Airborne.cam<span> v1.1b</span>
              </h3>
            </Grid>
            <Grid item xs={12} sm={4}>
              <a
                className="FooterLink"
                rel="noreferrer"
                target="_blank"
                href="https://royalsocietypublishing.org/doi/10.1098/rspa.2020.0584"
              >
                Scientific basis
              </a>
              <a
                className="FooterLink"
                rel="noreferrer"
                target="_blank"
                href="https://github.com/airborne-cam/airborne.cam/"
              >
                Source code
              </a>
            </Grid>
            <Grid item xs={12} sm={3}>
              <a
                className="FooterLink"
                rel="noreferrer"
                target="_blank"
                href="https://arxiv.org/abs/2009.12781v2"
              >
                Royal Society's RAMP guide
              </a>
              <a
                className="FooterLink"
                rel="noreferrer"
                target="_blank"
                href="https://aerosol-soc.com/covid-19"
              >
                UK Aerosol Society COVID-19
              </a>
            </Grid>
          </Grid>
        </div>
      </div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"About us"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <Box p={1} justifyItems="center" align="center">
              <Grid container spacing={0}>
                <Grid item xs={12} sm={4}>
                  Savvas Gkantonas
                </Grid>
                <Grid item xs={12} sm={4}>
                  Daniel Zabotti
                </Grid>
                <Grid item xs={12} sm={4}>
                  Dr Pedro Magalhães de Oliveira
                </Grid>
              </Grid>
            </Box>

            <Box p={1} justifyItems="center" align="center">
              <Grid container spacing={0}>
                <Grid item xs={12} sm={6}>
                  Dr Leo C.C. Mesquita
                </Grid>
                <Grid item xs={12} sm={6}>
                  Dr Epaminondas Mastorakos
                </Grid>
              </Grid>
            </Box>

            <Box p={1}>
              <a className="Contributors">
                With contributions from: Philip Sitte, Andrea Giusti, Megan
                Davies Wykes, Adam Boies, Marc Stettler, Robert Nishida.
              </a>
              <p className="Contributors">
                The authors thank Churchill College for their kind support and
                Cambridge Enterprise for their assistance.
              </p>{" "}
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleContactUs} color="primary" autoFocus>
            contact@airborne.cam
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
