import { Col, Input } from "antd";
import { useDispatch, useSelector } from "react-redux";
import RootState from "../model/RootState";
import { setFileZip, setPassword } from "../redux/slice/ScramblingSlice";
import { setCompetitionName } from "../redux/slice/WcifSlice";

const EntryInterface = () => {
    const editingStatus = useSelector(
        (state: RootState) => state.wcifSlice.editingStatus
    );
    const password = useSelector(
        (state: RootState) => state.scramblingSlice.password
    );
    const competitionName = useSelector(
        (state: RootState) => state.wcifSlice.wcif.name
    );
    const generatingScrambles = useSelector(
        (state: RootState) => state.scramblingSlice.generatingScrambles
    );

    const dispatch = useDispatch();

    const handleCompetitionNameChange = (name: string) => {
        dispatch(setCompetitionName(name));

        // Require another zip with the new name.
        dispatch(setFileZip());
    };

    const handlePasswordChange = (password: string) => {
        dispatch(setPassword(password));

        // Require another zip with the new password, in case there was a zip generated.
        dispatch(setFileZip());
    };

    return (
        <>
            <Col span={8}>
                <label>Competition name</label>
                <Input
                    id="competition-name"
                    placeholder="Competition Name"
                    onChange={(e) =>
                        handleCompetitionNameChange(e.target.value)
                    }
                    value={competitionName}
                    disabled={!editingStatus || generatingScrambles}
                />
            </Col>

            <Col span={8}>
                <label>Password</label>
                <Input.Password
                    id="password"
                    placeholder="Password"
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    value={password}
                    disabled={generatingScrambles}
                />
            </Col>
        </>
    );
};

export default EntryInterface;
