import * as React from 'react';

  
export interface DifferencesProps {
    newText: string;
    oldURL: string
}

export default class DifferenceRenderer extends React.Component<DifferencesProps> {
    render() {
        const {newText, oldURL} = this.props;
        return (
            <div>
                <h3 style={{textAlign: "left"}}>New Text:</h3>
                <p>
                    {newText}
                </p>
                <h3>Old URL:</h3>
                <p>
                    {oldURL}
                </p>
                <br/>
            </div>
        );
    }
}