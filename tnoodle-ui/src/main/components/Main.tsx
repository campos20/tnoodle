import { Button, Col, Form, message, Row } from "antd";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import tnoodleApi from "../api/tnoodle.api";
import { ScrambleClient } from "../api/tnoodle.socket";
import { isUsingStaging } from "../api/wca.api";
import RootState from "../model/RootState";
import {
    resetScramblingProgressCurrent,
    setFileZip,
    setGeneratingScrambles,
    setScramblingProgressCurrentEvent,
    setScramblingProgressTarget,
} from "../redux/slice/ScramblingSlice";
import EntryInterface from "./EntryInterface";
import EventPickerTable from "./EventPickerTable";
import Interceptor from "./Interceptor";
import "./Main.css";
import VersionInfo from "./VersionInfo";

const Main = () => {
    const [competitionNameFileZip, setCompetitionNameFileZip] = useState("");
    const mbld = useSelector((state: RootState) => state.mbldSlice.mbld);
    const password = useSelector(
        (state: RootState) => state.scramblingSlice.password
    );
    const translations = useSelector(
        (state: RootState) => state.fmcSlice.translations
    );
    const wcif = useSelector((state: RootState) => state.wcifSlice.wcif);
    const competitionId = useSelector(
        (state: RootState) => state.competitionSlice.competitionId
    );
    const generatingScrambles = useSelector(
        (state: RootState) => state.scramblingSlice.generatingScrambles
    );
    const officialZipStatus = useSelector(
        (state: RootState) => state.scramblingSlice.officialZipStatus
    );
    const fileZip = useSelector(
        (state: RootState) => state.scramblingSlice.fileZip
    );

    const interceptorRef = useRef<Interceptor>(null);

    const dispatch = useDispatch();

    const onSubmit = () => {
        message.info("Generating");

        if (generatingScrambles) {
            return;
        }

        if (!!fileZip) {
            tnoodleApi.convertToBlob(fileZip).then((blob) => downloadZip(blob));
        } else {
            generateZip();
        }
    };

    const onScrambleHandShake = (payload: Record<string, number>) =>
        dispatch(setScramblingProgressTarget(payload));

    const onScrambleProgress = (eventId: string) =>
        dispatch(setScramblingProgressCurrentEvent(eventId));

    const generateZip = () => {
        setCompetitionNameFileZip(wcif.name);

        let scrambleClient = new ScrambleClient(
            onScrambleHandShake,
            onScrambleProgress
        );

        tnoodleApi
            .fetchZip(scrambleClient, wcif, mbld, password, translations)
            .then((plainZip: { contentType: string; payload: string }) =>
                dispatch(setFileZip(plainZip))
            )
            .catch((err: any) => interceptorRef.current?.updateMessage(err))
            .finally(() => {
                dispatch(setGeneratingScrambles(false));
                dispatch(resetScramblingProgressCurrent());
            });
        dispatch(setGeneratingScrambles(true));
    };

    const downloadZip = (blob: Blob) => {
        // We use the unofficialZip to stamp .zip in order to prevent delegates / organizers mistakes.
        // If TNoodle version is not official (as per VersionInfo) or if we generate scrambles using
        // a competition from staging, add a [Unofficial]

        let isUnofficialZip =
            !officialZipStatus || (competitionId != null && isUsingStaging());

        let fileName =
            (isUnofficialZip ? "[UNOFFICIAL] " : "") +
            competitionNameFileZip +
            ".zip";

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.target = "_blank";
        link.setAttribute("type", "hidden");

        // This is needed for firefox
        document.body.appendChild(link);

        link.click();
        link.remove();
    };

    const scrambleButton = () => {
        if (generatingScrambles) {
            return (
                <Button
                    title="Wait until the process is done"
                    type="primary"
                    disabled
                >
                    Generating Scrambles
                </Button>
            );
        }
        if (!!fileZip) {
            return (
                <Button htmlType="submit" type="primary">
                    Download Scrambles
                </Button>
            );
        }

        // At least 1 events must have at least 1 round.
        let disableScrambleButton = !wcif.events
            .map((event) => event.rounds.length > 0)
            .reduce((flag1, flag2) => flag1 || flag2, false);

        return (
            <Button
                type="primary"
                htmlType="submit"
                disabled={disableScrambleButton}
                title={disableScrambleButton ? "No events selected." : ""}
            >
                Generate Scrambles
            </Button>
        );
    };

    return (
        <Form onFinish={onSubmit}>
            <div>
                <Interceptor ref={interceptorRef} />
                <VersionInfo />
                <Row>
                    <EntryInterface />
                    <Col span={8}>
                        &nbsp; {/* Align */}
                        <Form.Item>{scrambleButton()}</Form.Item>
                    </Col>
                </Row>
            </div>
            <EventPickerTable />
        </Form>
    );
};

export default Main;
