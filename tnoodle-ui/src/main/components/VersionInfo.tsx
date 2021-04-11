import { Alert } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import tnoodleApi from "../api/tnoodle.api";
import wcaApi from "../api/wca.api";
import CurrentTnoodle from "../model/CurrentTnoodle";
import { setOfficialZipStatus } from "../redux/slice/ScramblingSlice";

const VersionInfo = () => {
    const [currentTnoodle, setCurrentTnoodle] = useState<CurrentTnoodle>();
    const [allowedTnoodleVersions, setAllowedTnoodleVersions] = useState<
        string[]
    >();
    const [runningVersion, setRunningVersion] = useState<string>();
    const [signedBuild, setSignedBuild] = useState<boolean>();
    const [signatureKeyBytes, setSignatureKeyBytes] = useState<string>();
    const [wcaPublicKeyBytes, setWcaPublicKeyBytes] = useState<string>();
    const [signatureValid, setSignatureValid] = useState(true);

    useEffect(
        () =>
            setSignatureValid(
                !!signedBuild && signatureKeyBytes === wcaPublicKeyBytes
            ),
        [signedBuild, signatureKeyBytes, wcaPublicKeyBytes]
    );

    const dispatch = useDispatch();

    useEffect(() => {
        // Fetch from WCA API.
        wcaApi.fetchVersionInfo().then((response) => {
            setCurrentTnoodle(response.data.current);
            setAllowedTnoodleVersions(response.data.allowed);
            setWcaPublicKeyBytes(response.data.publicKeyBytes);
        });

        tnoodleApi.fetchRunningVersion().then((response) => {
            setRunningVersion(
                !!response.data.projectName && !!response.data.projectVersion
                    ? `${response.data.projectName}-${response.data.projectVersion}`
                    : ""
            );
            setSignedBuild(response.data.signedBuild);
            setSignatureKeyBytes(response.data.signatureKeyBytes);
        });
    }, [dispatch]);

    const tnoodleLink = <a href={currentTnoodle?.download}>here</a>;

    // This avoids global state update while rendering
    const analyzeVerion = () => {
        // We wait until both wca and tnoodle answers
        if (!allowedTnoodleVersions || !runningVersion) {
            return;
        }

        dispatch(
            setOfficialZipStatus(
                signatureValid &&
                    allowedTnoodleVersions.includes(runningVersion)
            )
        );
    };
    useEffect(analyzeVerion, [
        allowedTnoodleVersions,
        dispatch,
        runningVersion,
        signatureValid,
    ]);

    // We cannot analyze TNoodle version here. We do not bother the user.
    if (!runningVersion || !allowedTnoodleVersions) {
        return null;
    }

    // Running version is not the most recent release
    if (runningVersion !== currentTnoodle?.name) {
        // Running version is allowed, but not the latest.
        if (allowedTnoodleVersions.includes(runningVersion)) {
            return (
                <Alert
                    type="info"
                    message={
                        <>
                            You are running {runningVersion}, which is still
                            allowed, but you should upgrade to{" "}
                            {currentTnoodle?.name} available {tnoodleLink} as
                            soon as possible
                        </>
                    }
                />
            );
        }

        return (
            <Alert
                type="error"
                message={
                    <>
                        You are running {runningVersion}, which is not allowed.
                        Do not use scrambles generated in any official
                        competition and consider downloading the latest version{" "}
                        {tnoodleLink}.
                    </>
                }
            ></Alert>
        );
    }

    // Generated version is not an officially signed jar
    if (!signatureValid) {
        return (
            <Alert
                type="error"
                message={`You are running an unsigned TNoodle release. Do not use scrambles generated in any official competition and consider downloading the official program ${(
                    <a href={currentTnoodle.download}>here</a>
                )}`}
            ></Alert>
        );
    }

    return null;
};

export default VersionInfo;
