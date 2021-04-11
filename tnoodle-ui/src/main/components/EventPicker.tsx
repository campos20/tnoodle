import { Card, Col, Input, Row, Select } from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MAX_WCA_ROUNDS } from "../constants/wca.constants";
import RootState from "../model/RootState";
import Round from "../model/Round";
import WcaEvent from "../model/WcaEvent";
import WcifEvent from "../model/WcifEvent";
import { setFileZip } from "../redux/slice/ScramblingSlice";
import { setWcaEvent } from "../redux/slice/WcifSlice";
import {
    copiesExtensionId,
    getDefaultCopiesExtension,
} from "../util/wcif.util";
import "./EventPicker.css";
import FmcTranslationsDetail from "./FmcTranslationsDetail";
import MbldDetail from "./MbldDetail";

interface EventPickerProps {
    wcaEvent: WcaEvent;
    wcifEvent?: WcifEvent;
}

const EventPicker = ({ wcaEvent, wcifEvent }: EventPickerProps) => {
    const wcaFormats = useSelector(
        (state: RootState) => state.wcifSlice.wcaFormats
    );
    const editingStatus = useSelector(
        (state: RootState) => state.wcifSlice.editingStatus
    );
    const generatingScrambles = useSelector(
        (state: RootState) => state.scramblingSlice.generatingScrambles
    );
    const scramblingProgressCurrent = useSelector(
        (state: RootState) => state.scramblingSlice.scramblingProgressCurrent
    );
    const scramblingProgressTarget = useSelector(
        (state: RootState) => state.scramblingSlice.scramblingProgressTarget
    );

    const dispatch = useDispatch();

    const updateEvent = (rounds: Round[]) => {
        let event = { id: wcaEvent.id, rounds };
        dispatch(setFileZip());
        dispatch(setWcaEvent(event));
    };
    const [image, setImage] = useState();

    useEffect(() => {
        import(`../assets/cubing-icon/${wcaEvent.id}.svg`).then((response) =>
            setImage(response.default)
        );
    }, [wcaEvent.id]);

    const handleNumberOfRoundsChange = (
        numberOfRounds: number,
        rounds: Round[]
    ) => {
        let newRounds = [...rounds];
        // Ajust the number of rounds in case we have to remove
        while (newRounds.length > numberOfRounds) {
            newRounds.pop();
        }

        // case we have to add
        while (newRounds.length < numberOfRounds) {
            newRounds.push({
                id: wcaEvent.id + "-r" + (newRounds.length + 1),
                format: wcaEvent.format_ids[0],
                scrambleSetCount: "1",
                extensions: [getDefaultCopiesExtension()],
            });
        }
        updateEvent(newRounds);
    };

    const handleGeneralRoundChange = (
        roundNumber: number,
        value: string,
        rounds: Round[],
        name: "format" | "scrambleSetCount"
    ) => {
        updateEvent(
            rounds.map((round, i) =>
                i !== roundNumber ? round : { ...round, [name]: value }
            )
        );
    };

    const handleNumberOfCopiesChange = (
        roundNumber: number,
        numCopies: string,
        rounds: Round[]
    ) => {
        updateEvent(
            rounds.map((round, i) =>
                i !== roundNumber
                    ? round
                    : {
                          ...round,
                          extensions: round.extensions.map((extension) =>
                              extension.id === copiesExtensionId
                                  ? { ...extension, data: { numCopies } }
                                  : extension
                          ),
                      }
            )
        );
    };

    const abbreviate = (str: string) =>
        !!wcaFormats ? wcaFormats[str].shortName : "-";

    const maybeShowTableTitles = (rounds: Round[]) => {
        if (rounds.length === 0) {
            return null;
        }
        return (
            <Row>
                <Col span={2}>#</Col>
                <Col span={6}>Format</Col>
                <Col span={8}>Scramble Sets</Col>
                <Col span={8}>Copies</Col>
            </Row>
        );
    };

    const maybeShowProgressBar = (rounds: Round[]) => {
        let eventId = wcaEvent.id;

        let current = scramblingProgressCurrent[eventId] || 0;
        let target = scramblingProgressTarget[eventId];

        if (rounds.length === 0 || !generatingScrambles || !target) {
            return;
        }

        let progress = (current / target) * 100;
        let miniThreshold = 2;

        if (progress === 0) {
            progress = miniThreshold;
        }

        return `${current} / ${target}`;

        // return ( // TODO
        //     <ProgressBar
        //         animated
        //         variant={progress === 100 ? "success" : "info"}
        //         now={progress}
        //         label={
        //             progress === 100 || progress < miniThreshold
        //                 ? ""
        //                 : `${current} / ${target}`
        //         }
        //     />
        // );
    };

    const getTitle = () => (
        <>
            <Row>
                <Col span={8}>
                    <img
                        className="img-thumbnail cubingIcon"
                        src={image}
                        alt={wcaEvent.name}
                    />
                </Col>
                <Col span={8}>
                    <h2>{wcaEvent.name}</h2>
                    <label>Rounds</label>
                </Col>
                <Col span={8}>
                    <Select<number>
                        className="form-control"
                        value={rounds.length}
                        onChange={(value) =>
                            handleNumberOfRoundsChange(value, rounds)
                        }
                        disabled={!editingStatus || generatingScrambles}
                    >
                        {Array.from({ length: MAX_WCA_ROUNDS + 1 }, (_, i) => (
                            <option key={i} value={i}>
                                {i}
                            </option>
                        ))}
                    </Select>
                </Col>
            </Row>
            {maybeShowProgressBar(rounds)}
        </>
    );
    const getBody = (i: number) => {
        let copies = rounds[i].extensions.find(
            (extension) => extension.id === copiesExtensionId
        )?.data.numCopies;

        return (
            <Row key={i}>
                <Col span={2}>{i + 1}</Col>
                <Col span={6}>
                    <Select<string>
                        className="form-control"
                        value={rounds[i].format}
                        onChange={(value) =>
                            handleGeneralRoundChange(i, value, rounds, "format")
                        }
                        disabled={!editingStatus || generatingScrambles}
                    >
                        {wcaEvent.format_ids.map((format) => (
                            <option key={format} value={format}>
                                {abbreviate(format)}
                            </option>
                        ))}
                    </Select>
                </Col>
                <Col span={8}>
                    <Input
                        className="form-control"
                        type="number"
                        value={rounds[i].scrambleSetCount}
                        onChange={(evt) =>
                            handleGeneralRoundChange(
                                i,
                                evt.target.value,
                                rounds,
                                "scrambleSetCount"
                            )
                        }
                        min={1}
                        required
                        disabled={!editingStatus || generatingScrambles}
                    />
                </Col>
                <Col span={8}>
                    <Input
                        className="form-control"
                        type="number"
                        value={copies}
                        onChange={(evt) =>
                            handleNumberOfCopiesChange(
                                i,
                                evt.target.value,
                                rounds
                            )
                        }
                        min={1}
                        required
                        disabled={generatingScrambles}
                    />
                </Col>
            </Row>
        );
    };

    let rounds = wcifEvent?.rounds || [];

    return (
        <>
            <Card title={getTitle()}>
                {maybeShowTableTitles(rounds)}
                {rounds.map((_, i) => getBody(i))}
                {wcaEvent.is_multiple_blindfolded && rounds.length > 0 && (
                    <MbldDetail />
                )}
                {wcaEvent.is_fewest_moves && rounds.length > 0 && (
                    <FmcTranslationsDetail />
                )}
            </Card>
        </>
    );
};

export default EventPicker;
